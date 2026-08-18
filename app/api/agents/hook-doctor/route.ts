
import { generateValidatedJson } from '@/lib/ai/generate-json';
import { HookDoctorOutputSchema } from '@/lib/ai/schemas';
import { buildHookDoctorPrompt } from '@/lib/ai/prompts/hook-doctor';

export async function POST(req: Request) {
  try {
    const { chapterContent, chapterSummary, genre } = await req.json();

    if (!chapterContent) {
      return Response.json({ error: '缺少章节正文' }, { status: 400 });
    }

    const systemPrompt = buildHookDoctorPrompt();
    const userPrompt = `【小说类型】${genre || '未知'}
【本章大纲】${chapterSummary || '（无）'}

【本章正文】
${chapterContent}

请判断并按要求返回 JSON。`;

    const result = await generateValidatedJson({
      schema: HookDoctorOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    return Response.json(result);
  } catch (error) {
    console.error('Error running hook doctor:', error);
    return Response.json(
      { error: '钩子检测失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
