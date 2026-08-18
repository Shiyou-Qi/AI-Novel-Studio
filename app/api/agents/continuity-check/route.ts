
import { generateValidatedJson } from '@/lib/ai/generate-json';
import { ContinuityCheckOutputSchema } from '@/lib/ai/schemas';
import { buildContinuityCheckPrompt } from '@/lib/ai/prompts/continuity-check';

export async function POST(req: Request) {
  try {
    const { chapterContent, chapterNumber, storyBible, characterStates, openThreads } = await req.json();

    if (!chapterContent) {
      return Response.json({ error: '缺少章节正文' }, { status: 400 });
    }

    const systemPrompt = buildContinuityCheckPrompt({
      storyBible: storyBible || { worldFacts: [] },
      characterStates: characterStates || [],
      openThreads: openThreads || [],
    });
    const userPrompt = `【第 ${chapterNumber} 章正文】\n${chapterContent}\n\n请按要求返回 JSON。`;

    const result = await generateValidatedJson({
      schema: ContinuityCheckOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.5,
    });

    return Response.json(result);
  } catch (error) {
    console.error('Error running continuity check:', error);
    return Response.json(
      { error: '连贯性检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
