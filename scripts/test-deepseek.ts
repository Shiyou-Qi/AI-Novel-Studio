
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// DeepSeek retired the legacy deepseek-chat/deepseek-reasoner model names on
// 2026-07-24 in favor of deepseek-v4-flash / deepseek-v4-pro. Both new models
// default to "thinking mode" on, which (a) ignores `temperature` silently and
// (b) returns extra `reasoning_content` — pass thinking:{type:'disabled'} via
// extra_body to get the old deepseek-chat-like fast/non-thinking behavior
// this app's prompts (structure/outline/chapter generation) actually want.
const MODELS_TO_TEST = ['deepseek-v4-flash', 'deepseek-v4-pro'];

async function testModel(model: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  console.log(`\n--- Testing model: ${model} ---`);

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '用一句话说明你是谁，并且只输出这句话。' }],
        temperature: 0.7,
        // NOTE: `extra_body` is an OpenAI *Python SDK* convention (the SDK unwraps it
        // and merges its contents into the top-level JSON body) — it is not itself a
        // wire-format field. Over raw REST, `thinking` must be sent top-level directly.
        thinking: { type: 'disabled' },
      }),
    });

    console.log('Status:', response.status);
    const text = await response.text();
    if (!response.ok) {
      console.error('Error body:', text);
      return;
    }
    const data = JSON.parse(text);
    const message = data.choices?.[0]?.message;
    console.log('content:', message?.content);
    console.log('reasoning_content present (should be absent/empty with thinking disabled):', !!message?.reasoning_content);
    console.log('reported model:', data.model);
  } catch (error) {
    console.error('Failed:', error);
  }
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('Missing DEEPSEEK_API_KEY in .env.local — cannot run smoke test.');
    process.exit(1);
  }
  for (const model of MODELS_TO_TEST) {
    await testModel(model);
  }
}

main();
