import Constants from 'expo-constants';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = 'https://api.anthropic.com/v1/messages';

// Model constants
export const MODEL_HAIKU = 'claude-haiku-4-5-20251001';
export const MODEL_SONNET = 'claude-sonnet-4-20250514';

export interface AiClientOptions {
  maxTokens?: number;
  timeoutMs?: number;
  model?: string;
}

export async function sendChatMessage(
  systemPrompt: string,
  messages: ChatMessage[],
  options?: AiClientOptions,
): Promise<string> {
  const apiKey = Constants.expoConfig?.extra?.anthropicApiKey as string | undefined;
  if (!apiKey || apiKey === 'YOUR_ANTHROPIC_API_KEY') {
    throw new Error('Anthropic API key not configured');
  }

  const maxTokens = options?.maxTokens ?? 1024;
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const model = options?.model ?? MODEL_HAIKU;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text ?? '';
  } finally {
    clearTimeout(timeout);
  }
}
