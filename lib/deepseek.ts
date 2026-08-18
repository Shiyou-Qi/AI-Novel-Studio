
const BASE_URL = 'https://api.deepseek.com/v1';

export const DEEPSEEK_MODELS = {
  chat: 'deepseek-chat',
  reasoner: 'deepseek-reasoner',
} as const;

export type DeepseekModel = typeof DEEPSEEK_MODELS[keyof typeof DEEPSEEK_MODELS];

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(
  messages: Message[],
  options: {
    model?: string;
    temperature?: number;
    jsonMode?: boolean;
  } = {}
) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('Missing DEEPSEEK_API_KEY');

  const body: any = {
    model: options.model || DEEPSEEK_MODELS.chat,
    messages,
    temperature: options.temperature ?? 0.7,
    stream: false,
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function streamChatCompletion(
  messages: Message[],
  options: {
    model?: string;
    temperature?: number;
  } = {}
) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('Missing DEEPSEEK_API_KEY');

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || DEEPSEEK_MODELS.chat,
      messages,
      temperature: options.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.body;
}
