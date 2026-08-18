
import { streamText } from 'ai';
import { deepseek, DEEPSEEK_MODELS } from '@/lib/ai/deepseek-provider';

export async function POST(req: Request) {
  try {
    const { title, theme, genre, structure, chapter, wordsPerChapter, previousChapter, guidance } = await req.json();

    // Validate structure and characters
    if (!structure || !structure.mainCharacters || !Array.isArray(structure.mainCharacters)) {
      console.error('Invalid or missing characters in structure:', structure);
      throw new Error('故事架构中缺少角色信息，请先生成故事架构');
    }

    const systemPrompt = `你是一位专业的小说创作者。请根据小说大纲和上下文，创作第 ${chapter.number} 章的正文内容。
要求：
1. 严格遵循章节大纲，但可以在细节上进行发挥
2. 描写生动细腻，注重环境渲染和心理刻画
3. 对话自然流畅，符合人物性格
4. 确保情节连贯，与上一章（如果有）衔接自然
5. 字数控制在 ${wordsPerChapter} 字左右
6. 直接输出正文内容，不要包含标题或其他解释性文字`;

    const userPrompt = `【小说信息】
标题：${title}
类型：${genre}
核心主题：${theme}

【故事架构】
世界观：${structure.worldSetting}
主要角色：
${structure.mainCharacters.map((c: { name: string; role: string; description: string; motivation: string }) =>
  `- ${c.name}（${c.role}）：${c.description}`
).join('\n')}

【上一章概要】
${previousChapter ? `第 ${previousChapter.number} 章：${previousChapter.title}\n${previousChapter.outline}` : '这是第一章'}

【本章信息】
第 ${chapter.number} 章：${chapter.title}
大纲：${chapter.outline}

${guidance ? `【创作指导】${guidance}` : ''}

请开始创作本章正文：`;

    const result = streamText({
      model: deepseek(DEEPSEEK_MODELS.flash),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating chapter:', error);
    return Response.json(
      { error: '生成章节失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
