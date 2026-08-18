
import { streamText } from 'ai';
import { deepseek, DEEPSEEK_MODELS } from '@/lib/ai/deepseek-provider';
import { buildReviserPrompt } from '@/lib/ai/prompts/reviser';

export async function POST(req: Request) {
  try {
    const { chapterContent, qualityNotes, continuityIssues } = await req.json();

    if (!chapterContent) {
      return Response.json({ error: '缺少章节正文' }, { status: 400 });
    }

    const systemPrompt = buildReviserPrompt({
      qualityNotes: qualityNotes || [],
      continuityIssues: continuityIssues || [],
    });
    const userPrompt = `【原文】\n${chapterContent}\n\n请输出修改后的完整正文：`;

    const result = streamText({
      model: deepseek(DEEPSEEK_MODELS.flash),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.6,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error running reviser:', error);
    return Response.json(
      { error: '修订失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
