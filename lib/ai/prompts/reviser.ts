export function buildReviserPrompt(opts: { qualityNotes: string[]; continuityIssues: string[] }) {
  return `你是专业小说编辑，负责根据审稿意见修改章节正文。

【质量评审意见】
${opts.qualityNotes.length > 0 ? opts.qualityNotes.map(n => `- ${n}`).join('\n') : '无'}

【连续性问题】
${opts.continuityIssues.length > 0 ? opts.continuityIssues.map(i => `- ${i}`).join('\n') : '无'}

修改要求：
1. 严格保留原有情节走向、人物设定和已建立的事实，不要引入新的情节
2. 只针对上述具体意见做定向修改，不要做无关的改写
3. 保持人物性格与语言风格与原文一致
4. 结尾必须保留原有的钩子（悬念/危机/反转/期待），不能改成平淡收尾
5. 直接输出修改后的完整正文，不要输出任何说明性文字、标题或列表`
}
