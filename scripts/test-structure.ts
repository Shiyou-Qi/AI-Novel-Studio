
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Dynamic import (not static) so it evaluates after dotenv.config() above has
// run. Static imports are hoisted under ESM (which tsx uses) and would import
// lib/ai/deepseek-provider.ts - which reads process.env.DEEPSEEK_API_KEY at
// module load time - before dotenv had a chance to populate it. Next.js's own
// app routes don't hit this: Next.js preloads .env.local before any route
// module is imported, so this ordering issue is specific to standalone scripts.
async function testStructure() {
  const { generateValidatedJson } = await import('../lib/ai/generate-json');
  const { StructureOutputSchema } = await import('../lib/ai/schemas');

  console.log('Testing generate structure...');
  try {
    const systemPrompt = `你是一位专业的小说架构师。请根据用户提供的信息，创建一个完整的小说架构。
请务必返回合法的 JSON 格式。
JSON 结构如下：
{
  "worldSetting": "string",
  "mainCharacters": [],
  "plotSummary": "string",
  "themes": [],
  "timeline": "string"
}`;

    const userPrompt = `小说标题：测试小说
核心创意/主题：测试
小说类型：玄幻
创作指导：无`;

    console.log('Sending request...');
    const structure = await generateValidatedJson({
      schema: StructureOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    console.log('Parsed structure:', JSON.stringify(structure, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStructure();
