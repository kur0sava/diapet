const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const ALLOWED_MODELS = new Set([DEFAULT_MODEL, 'claude-sonnet-4-6']);

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const MAX_BODY_BYTES = 64 * 1024;

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

type RequestBody = {
  systemPrompt?: string;
  messages?: Array<{ role?: string; content?: string }>;
  options?: {
    maxTokens?: number;
    timeoutMs?: number;
    model?: string;
  };
};

const rateLimitState = new Map<string, { count: number; windowStart: number }>();

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function sanitizeMessages(
  input: RequestBody['messages']
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(input)) return [];

  return input
    .filter(
      item =>
        (item?.role === 'user' || item?.role === 'assistant') &&
        typeof item?.content === 'string' &&
        item.content.trim().length > 0
    )
    .slice(-20)
    .map(item => ({
      role: item!.role as 'user' | 'assistant',
      content: item!.content!.trim().slice(0, 8000),
    }));
}

function clientFingerprint(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitState.get(key);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitState.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, retryAfterSec: Math.ceil(retryAfterMs / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

function hasValidAuth(req: Request): boolean {
  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) return false;
  const token = authHeader.slice(7).trim();
  return token.length > 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  if (!hasValidAuth(req)) {
    return jsonResponse(401, { error: 'Missing or invalid Authorization header' });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return jsonResponse(500, { error: 'ANTHROPIC_API_KEY is not configured' });
  }

  const fingerprint = clientFingerprint(req);
  const limit = checkRateLimit(fingerprint);
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfterSec: limit.retryAfterSec }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Retry-After': String(limit.retryAfterSec) },
      }
    );
  }

  // H1: enforce body size on actual bytes received, not on the trusted
  // content-length header. A caller that omits or lies about content-length
  // would otherwise stream an unbounded payload to Anthropic on our dollar.
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return jsonResponse(400, { error: 'Failed to read body' });
  }
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: 'Request body too large' });
  }

  let body: RequestBody;
  try {
    body = JSON.parse(raw) as RequestBody;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt.trim() : '';
  const messages = sanitizeMessages(body.messages);
  const model =
    typeof body.options?.model === 'string' && ALLOWED_MODELS.has(body.options.model)
      ? body.options.model
      : DEFAULT_MODEL;
  const maxTokens = clamp(body.options?.maxTokens, 128, 4096, 1024);
  const timeoutMs = clamp(body.options?.timeoutMs, 5000, 55000, 30000);

  if (!systemPrompt) {
    return jsonResponse(400, { error: 'systemPrompt is required' });
  }

  if (messages.length === 0) {
    return jsonResponse(400, { error: 'messages are required' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt.slice(0, 12000),
        messages,
      }),
      signal: controller.signal,
    });

    const responseText = await anthropicResponse.text();
    if (!anthropicResponse.ok) {
      // M4: log full upstream error server-side, but return a generic body to
      // the client — Anthropic error messages can include internal request
      // shape and rate-limit quotas that probe usage.
      console.error(
        'Anthropic non-2xx',
        anthropicResponse.status,
        responseText.slice(0, 2000)
      );
      return jsonResponse(anthropicResponse.status, {
        error: 'AI request failed',
      });
    }

    const data = JSON.parse(responseText) as { content?: Array<{ text?: string }> };
    return jsonResponse(200, { text: data.content?.[0]?.text ?? '' });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return jsonResponse(504, { error: 'Anthropic request timed out' });
    }
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : 'Unknown proxy error',
    });
  } finally {
    clearTimeout(timeout);
  }
});
