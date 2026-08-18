
import dotenv from 'dotenv';
import { chatCompletion, DEEPSEEK_MODELS } from '../lib/deepseek';

dotenv.config({ path: '.env.local' });

async function testStructure() {
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
    const content = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      model: DEEPSEEK_MODELS.chat,
      jsonMode: true
    });

    console.log('Received content:', content);
    const parsed = JSON.parse(content);
    console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStructure();
