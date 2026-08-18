export function buildQualityCriticPrompt(opts: { genre: string; beatType: string; isGoldenChapter: boolean }) {
  return `你是严格的网文编辑，请从"追更价值"角度评估这一章，给出 0-100 的量化评分。

评分维度：
- hookStrength：结尾是否让人必须看下一章
- pacing：本章节奏是否张弛有度，符合其节拍类型（${opts.beatType}）
- satisfactionDensity：爽点/情绪释放的密度是否足够（结合类型 ${opts.genre} 的常见期待）
- dialogueNaturalness：对话是否自然、符合人物性格，避免生硬说明
- showVsTell：是否通过场景、动作、细节展现而非直白讲述
- overall：综合评分

${opts.isGoldenChapter ? '注意：这是黄金三章之一，标准应更严格——必须在冲突切入、钩子强度、成长证据这几点上明显优于普通章节。' : ''}

请给出每个维度的分数，以及 3-5 条具体、可执行的修改建议（notes）。
每条建议必须指出具体问题所在并给出可操作的修改方向，不要泛泛而谈（如"节奏可以更好"这种说法不合格，
应写成"第X段的追逐戏描写过于简略，可增加环境细节和角色的生理反应来增强紧张感"这样的具体建议）。`
}
