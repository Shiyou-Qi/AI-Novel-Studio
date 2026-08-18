
import { streamChatCompletion, DEEPSEEK_MODELS } from '@/lib/deepseek';

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

    const stream = await streamChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      model: DEEPSEEK_MODELS.chat,
      temperature: 0.8
    });

    // Create a TransformStream to convert DeepSeek/OpenAI format to the custom format expected by the frontend
    // Frontend expects: data: {"content": "..."}
    // DeepSeek returns: data: {"choices":[{"delta":{"content":"..."}}]}
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              // Re-format to what the frontend expects
              const payload = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    });

    if (!stream) throw new Error('No stream returned');

    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error generating chapter:', error);
    return Response.json(
      { error: '生成章节失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
