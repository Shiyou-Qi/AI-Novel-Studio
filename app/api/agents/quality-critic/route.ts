
import { generateValidatedJson } from '@/lib/ai/generate-json';
import { QualityScoreSchema } from '@/lib/ai/schemas';
import { buildQualityCriticPrompt } from '@/lib/ai/prompts/quality-critic';

export async function POST(req: Request) {
  try {
    const { chapterContent, genre, beatType, isGoldenChapter } = await req.json();

    if (!chapterContent) {
      return Response.json({ error: '缺少章节正文' }, { status: 400 });
    }

    const systemPrompt = buildQualityCriticPrompt({
      genre: genre || '未知',
      beatType: beatType || 'setup',
      isGoldenChapter: !!isGoldenChapter,
    });
    const userPrompt = `【本章正文】\n${chapterContent}\n\n请按要求返回 JSON 评分。`;

    const result = await generateValidatedJson({
      schema: QualityScoreSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.4,
    });

    return Response.json(result);
  } catch (error) {
    console.error('Error running quality critic:', error);
    return Response.json(
      { error: '质量评分失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
