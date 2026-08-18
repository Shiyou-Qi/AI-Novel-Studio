export interface StoryBibleContext {
  worldFacts: string[]
}

export interface CharacterStateContext {
  characterId: string
  name: string
  currentState: string
}

export interface OpenThreadContext {
  id: string
  title: string
  description: string
}

export function buildContinuityCheckPrompt(opts: {
  storyBible: StoryBibleContext
  characterStates: CharacterStateContext[]
  openThreads: OpenThreadContext[]
}) {
  const bibleSection = opts.storyBible.worldFacts.length > 0
    ? opts.storyBible.worldFacts.map(f => `- ${f}`).join('\n')
    : '（尚未记录任何已确立事实）'

  const statesSection = opts.characterStates.length > 0
    ? opts.characterStates.map(c => `- ${c.name}：${c.currentState}`).join('\n')
    : '（尚未记录角色状态，以故事架构中的初始设定为准）'

  const threadsSection = opts.openThreads.length > 0
    ? opts.openThreads.map(t => `[${t.id}] ${t.title}：${t.description}`).join('\n')
    : '（当前没有待回收的伏笔）'

  return `你是小说连续性审校员，负责核对本章内容与已建立设定是否矛盾，并提取本章新确立的事实。

【当前故事圣经（已确立的世界观事实）】
${bibleSection}

【角色当前状态】
${statesSection}

【待验证的伏笔】
${threadsSection}

请完成以下工作：
1. issues：找出本章与已知设定矛盾之处（能力/外貌/关系前后不一致，时间线错误，已死角色再现等）。
   如果没有矛盾，返回空数组。severity 分为 minor（细节瑕疵）或 major（严重逻辑漏洞）。
2. characterStateUpdates：提取本章中角色状态发生的变化（成长、受伤、情感变化、关系变化）。
   只记录本章真正发生变化的角色，updatedState 应该是简洁的当前状态描述（不超过100字），
   relationshipChanges 记录与其他角色关系的变化（无变化则为 null）。
3. newWorldFacts：提取本章新确立的、后续应保持一致的世界观事实（简洁的陈述句，每条一个事实）。
4. threadUpdates：判断本章是否呼应或解决了上述伏笔，引用其 threadId（必须是上面列出的真实 ID，
   不要编造）。呼应但未解决用 reinforced，完全解决用 paid_off。`
}
