import Constants from 'expo-constants';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = 'https://api.anthropic.com/v1/messages';

export async function sendChatMessage(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const apiKey = Constants.expoConfig?.extra?.anthropicApiKey as string | undefined;
  if (!apiKey || apiKey === 'YOUR_ANTHROPIC_API_KEY') {
    throw new Error('Anthropic API key not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text ?? '';
}
