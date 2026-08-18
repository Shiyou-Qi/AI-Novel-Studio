
import { generateValidatedJson } from '@/lib/ai/generate-json';
import { StructureOutputSchema } from '@/lib/ai/schemas';
import { buildArchitectAddendum } from '@/lib/ai/prompts/architect';

export async function POST(req: Request) {
  try {
    const { title, theme, genre, guidance, targetChapters } = await req.json();

    const systemPrompt = `你是一位专业的小说架构师。请根据用户提供的信息，创建一个完整的小说架构。
请务必返回合法的 JSON 格式，不要包含 Markdown 代码块标记（如 \`\`\`json）。
JSON 结构如下：
{
  "worldSetting": "世界观设定，包括时代背景、地理环境、社会结构等",
  "mainCharacters": [
    {
      "name": "角色名称",
      "role": "角色身份，如主角、反派、配角等",
      "description": "角色外貌、性格特点",
      "motivation": "角色的核心动机和目标"
    }
  ],
  "plotSummary": "故事情节概要，包括开端、发展、高潮、结局",
  "themes": ["故事的核心主题1", "故事的核心主题2"],
  "timeline": "故事时间线概述",
  "protagonistGoalLadder": [
    { "stage": "所处阶段", "goal": "具体目标", "obstacle": "主要阻碍", "payoff": "达成后的爽点" }
  ],
  "antagonistForces": [
    { "name": "名称", "type": "person|organization|system|nature|self", "motivation": "动机", "threatLevel": "early|mid|late|final" }
  ],
  "genreTropes": ["选用的类型元素1", "选用的类型元素2"],
  "titleCandidates": [
    { "title": "备选书名", "rationale": "吸引力说明" }
  ],
  "blurb": "80-150字的一句话简介"
}

${buildArchitectAddendum({ genre, targetChapters: targetChapters || 10 })}`;

    const userPrompt = `小说标题：${title}
核心创意/主题：${theme}
小说类型：${genre}
目标章节数：${targetChapters || 10} 章
${guidance ? `创作指导：${guidance}` : ''}

请创建一个引人入胜、逻辑自洽的故事架构。确保：
1. 世界观设定要详细且符合类型特点
2. 角色要有鲜明的个性和清晰的动机
3. 情节要有张力和起伏
4. 主题要深刻且贯穿全文

请直接返回 JSON 数据，必须包含上述结构中的所有字段。`;

    const structure = await generateValidatedJson({
      schema: StructureOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return Response.json({ structure });
  } catch (error) {
    console.error('Error generating structure details:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
      console.error('Cause:', error.cause);
    }
    return Response.json(
      { error: '生成架构失败，请重试', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
