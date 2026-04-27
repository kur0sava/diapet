import {
  getAiProxyUrl,
  getSupabaseAnonKey,
  isAiProxyConfigured,
} from '@shared/config/runtimeConfig';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const MODEL_HAIKU = 'claude-haiku-4-5-20251001';
export const MODEL_SONNET = 'claude-sonnet-4-6';

export interface AiClientOptions {
  maxTokens?: number;
  timeoutMs?: number;
  model?: string;
}

export function isAiConfigured(): boolean {
  return isAiProxyConfigured();
}

export async function sendChatMessage(
  systemPrompt: string,
  messages: ChatMessage[],
  options?: AiClientOptions
): Promise<string> {
  const proxyUrl = getAiProxyUrl();
  if (!proxyUrl) {
    throw new Error('AI proxy URL not configured');
  }

  const maxTokens = options?.maxTokens ?? 1024;
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const model = options?.model ?? MODEL_HAIKU;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const anonKey = getSupabaseAnonKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`;
      headers['apikey'] = anonKey;
    }

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        systemPrompt,
        messages: messages.map(message => ({
          role: message.role,
          content: message.content,
        })),
        options: {
          maxTokens,
          timeoutMs,
          model,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as { text?: string };
    return data.text ?? '';
  } finally {
    clearTimeout(timeout);
  }
}
