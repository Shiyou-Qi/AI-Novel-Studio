
import { chatCompletion, DEEPSEEK_MODELS } from '@/lib/deepseek';
import { tryRepairAndParseJson } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received outline request:', JSON.stringify(body, null, 2))
    
    const { title, theme, genre, structure, targetChapters, guidance, startChapter, totalChapters, previousChapters } = body
    
    // Validate required fields
    if (!title || !genre || !structure || !targetChapters) {
      console.error('Missing required fields:', { title: !!title, genre: !!genre, structure: !!structure, targetChapters: !!targetChapters })
      return Response.json(
        { error: '缺少必需字段', details: 'title, genre, structure, and targetChapters are required' },
        { status: 400 }
      )
    }
    
    if (!structure.worldSetting || !structure.plotSummary) {
      console.error('Invalid structure:', structure)
      return Response.json(
        { error: '故事架构不完整', details: 'structure must include worldSetting and plotSummary' },
        { status: 400 }
      )
    }
    
    if (!structure.mainCharacters || !Array.isArray(structure.mainCharacters) || structure.mainCharacters.length === 0) {
      console.error('No characters in structure:', structure.mainCharacters)
      return Response.json(
        { error: '故事架构中缺少角色信息', details: 'structure.mainCharacters must be a non-empty array' },
        { status: 400 }
      )
    }

    const batchInfo = startChapter ? `第 ${startChapter} 到 ${startChapter + targetChapters - 1} 章（共 ${totalChapters} 章）` : `${targetChapters} 章`
    const previousContext = previousChapters && previousChapters.length > 0 
      ? `\n\n【前文章节】\n${previousChapters.map((c: any) => `第${c.number}章 ${c.title}：${c.outline}`).join('\n\n')}\n\n请确保后续章节与前文连贯，情节自然衔接。`
      : ''

    const systemPrompt = `你是一位专业的小说大纲策划师。请根据用户提供的小说架构，创建${batchInfo}的详细大纲。
请务必返回合法的 JSON 格式，不要包含 Markdown 代码块标记。
JSON 结构如下：
{
  "chapters": [
    {
      "number": 1,
      "title": "章节标题",
      "outline": "章节大纲，详细描述本章的主要情节、人物互动和关键事件"
    }
  ]
}

注意：返回的章节数量必须是 ${targetChapters} 章。`;

    const userPrompt = `【小说信息】
标题：${title}
类型：${genre}
核心主题：${theme}

【故事架构】
世界观：${structure.worldSetting}

主要角色：
${structure.mainCharacters.map((c: { name: string; role: string; description: string; motivation: string }) => 
  `- ${c.name}（${c.role}）：${c.description}。动机：${c.motivation}`
).join('\n')}

故事梗概：${structure.plotSummary}

核心主题：${structure.themes.join('、')}

${guidance ? `【创作指导】${guidance}` : ''}${previousContext}

请创建${batchInfo}的详细大纲，确保：
1. 每章标题要吸引人，能概括章节核心
2. 每章大纲要包含主要情节、角色互动、关键转折
3. 章节之间要有逻辑递进和情感起伏
4. 整体节奏要张弛有度，前后呼应
5. 伏笔和悬念要合理安排
${startChapter ? `6. 这是第 ${startChapter} 到 ${startChapter + targetChapters - 1} 章，请确保与前文连贯` : ''}

请直接返回 JSON 数据，必须包含 ${targetChapters} 个章节。`;

    const content = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      model: DEEPSEEK_MODELS.chat,
      jsonMode: true
    });

    let result;
    try {
      result = tryRepairAndParseJson(content);
      
      if (!result || !result.chapters || !Array.isArray(result.chapters)) {
        console.error('Invalid AI response structure:', result);
        throw new Error('AI 返回的数据结构不正确，缺少章节列表');
      }
    } catch (e) {
      console.error('Failed to parse AI response. Content:', content);
      throw new Error(e instanceof Error ? e.message : 'AI 返回的数据格式不正确');
    }

    // Add IDs and default status to chapters
    const chaptersWithMeta = result.chapters.map((ch: any, index: number) => ({
      ...ch,
      id: crypto.randomUUID(),
      number: index + 1,
      content: '',
      wordCount: 0,
      status: 'outline' as const,
    }));

    return Response.json({ chapters: chaptersWithMeta });
  } catch (error) {
    console.error('Error generating outline details:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
      console.error('Cause:', error.cause);
    }
    return Response.json(
      { error: '生成大纲失败，请重试', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
