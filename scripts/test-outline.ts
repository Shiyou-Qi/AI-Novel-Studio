
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { generateValidatedJson } = await import('../lib/ai/generate-json');
  const { OutlineOutputSchema } = await import('../lib/ai/schemas');
  const { buildOutlineAddendum } = await import('../lib/ai/prompts/outline');

  const systemPrompt = `你是一位专业的小说大纲策划师。请根据用户提供的小说架构，创建10章的详细大纲。
请务必返回合法的 JSON 格式，不要包含 Markdown 代码块标记。
JSON 结构如下：
{
  "chapters": [
    { "number": 1, "title": "章节标题", "outline": "大纲", "beatType": "setup|rising|satisfaction|suspense|twist|cliffhanger", "hookNote": "钩子说明", "isGoldenChapter": false }
  ],
  "newPlotThreads": [],
  "threadUpdates": []
}
注意：返回的章节数量必须是 10 章。

${buildOutlineAddendum({ hookCadence: 3, startChapter: 1, openThreads: [] })}`;

  const userPrompt = `【小说信息】
标题：测试悬疑小说
类型：mystery
核心主题：AI监控社会

【故事架构】
世界观：近未来的智能城市
主要角色：
- 林澈（主角）：系统工程师。动机：查明真相

故事梗概：一个关于AI监控与人性的故事

请创建10章的详细大纲，必须包含 10 个章节。`;

  console.log('Sending request...');
  const result = await generateValidatedJson({
    schema: OutlineOutputSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  console.log(`Got ${result.chapters.length} chapters`);
  result.chapters.forEach((c) => {
    console.log(`#${c.number} isGoldenChapter=${JSON.stringify(c.isGoldenChapter)} (type: ${typeof c.isGoldenChapter}) beatType=${c.beatType}`);
  });
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
