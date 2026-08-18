import { getGenreTropeInfo } from '../genre-tropes'

export function buildArchitectAddendum(opts: { genre: string; targetChapters: number }) {
  const trope = getGenreTropeInfo(opts.genre)
  const tropeList = trope.commonTropes.length > 0 ? trope.commonTropes.join('、') : '（无特定类型元素，保持人物动机清晰、冲突具体）'

  return `在原有故事架构基础上，请额外提供：

1. protagonistGoalLadder（主角目标阶梯）：设计 4-6 个循序渐进的目标节点，每个节点包含
   stage（所处阶段）、goal（具体目标）、obstacle（主要阻碍）、payoff（达成后的爽点）。
   这个阶梯要与目标 ${opts.targetChapters} 章的篇幅相匹配，避免前期目标过大导致节奏拖沓。

2. antagonistForces（反派/对立势力）：设计 1-3 股对立力量，包含名称、类型
   （person/organization/system/nature/self）、动机、登场阶段（early/mid/late/final）。

3. genreTropes：结合当前小说类型，从以下常见元素中选择 3-6 个并让后续情节围绕其展开：
   ${tropeList}
   节奏参考：${trope.pacingNotes}

4. titleCandidates：额外提供 3-5 个更具吸引力的备选书名，每个附一句话说明吸引力所在
   （如制造悬念/反差感/身份感）。

5. blurb：撰写 80-150 字的一句话简介，用于列表页展示——开篇即制造冲突或悬念，
   避免平铺直叙的背景介绍，让读者在 3 秒内产生点击欲望。`
}
