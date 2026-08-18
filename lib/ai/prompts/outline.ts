export interface OpenThread {
  id: string
  title: string
  description: string
}

export function buildOutlineAddendum(opts: {
  hookCadence: number
  startChapter: number
  openThreads: OpenThread[]
}) {
  const isGoldenRange = opts.startChapter <= 3

  const goldenSection = isGoldenRange ? `
【黄金三章特别要求】第 1-3 章决定读者是否继续阅读，必须：
1. 第1章从冲突或异常事件切入（避免大段背景铺垫），结尾前设置强钩子
2. 第1章结尾最后 200-300 字必须是未解决的悬念/危机/反转，不能平静收尾
3. 第2-3章必须展示主角能力成长的具体证据，并引入第一个明确的对手/冲突源
4. 避免：大段世界观说明文字、内心独白超过3段、开篇即"设定播报"
将第 1-3 章的 isGoldenChapter 设为 true，其余章节设为 false。
` : '将本批次所有章节的 isGoldenChapter 设为 false（黄金三章仅指第 1-3 章）。'

  const threadSection = opts.openThreads.length > 0
    ? `以下伏笔尚未回收，请在合适的章节中呼应或回收，并在 threadUpdates 中引用其 threadId：
${opts.openThreads.map(t => `[${t.id}] ${t.title}：${t.description}`).join('\n')}`
    : '当前没有待回收的伏笔。'

  return `除了原有大纲要求外，请为每一章额外提供：
- beatType：本章的节拍类型，必须是以下之一：setup（铺垫）/ rising（上升）/ satisfaction（爽点）/ suspense（悬念）/ twist（反转）/ cliffhanger（悬念钩子）
- hookNote：本章结尾具体使用了什么钩子手法（一句话说明）
- isGoldenChapter：是否属于第 1-3 章

节奏要求：
- 每 ${opts.hookCadence} 章至少要有一章的 beatType 为 suspense/twist/cliffhanger 之一
- 每 3-4 章至少要有一章包含明确的 satisfaction（爽点）节拍
${goldenSection}
【伏笔管理】
${threadSection}
若本批次设置了新伏笔，请在 newPlotThreads 中列出 title（标题）、description（描述）、
plantedChapter（埋设章节号）、intendedPayoffChapter（预计回收章节号，若不确定可为 null）、
importance（minor/major）。`
}
