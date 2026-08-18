export function buildDraftAddendum(opts: {
  worldFacts?: string[]
  characterStates?: { name: string; currentState: string }[]
  beatType?: string
  isGoldenChapter?: boolean
}) {
  const parts: string[] = []

  parts.push(`【结尾要求】本章结尾最后一段必须满足以下之一：
悬念型（抛出未解决的问题）、危机型（主角面临新的紧迫威胁）、反转型（揭示改变认知的信息）、
期待型（明确预告下一章重要看点）。
严禁：平静的总结性陈述、场景自然收尾且无遗留张力、大段抒情或说教收尾。`)

  if (opts.worldFacts && opts.worldFacts.length > 0) {
    parts.push(`【故事圣经·已确立事实，创作时必须保持一致】\n${opts.worldFacts.map(f => `- ${f}`).join('\n')}`)
  }

  if (opts.characterStates && opts.characterStates.length > 0) {
    parts.push(`【角色当前状态，创作时以此为准而非仅参考初始设定】\n${opts.characterStates.map(c => `- ${c.name}：${c.currentState}`).join('\n')}`)
  }

  if (opts.beatType) {
    parts.push(`本章节拍类型：${opts.beatType}${opts.isGoldenChapter ? '（黄金三章之一，需严格执行黄金三章写作要求：从冲突切入、避免大段铺垫、结尾强钩子）' : ''}`)
  }

  return parts.join('\n\n')
}
