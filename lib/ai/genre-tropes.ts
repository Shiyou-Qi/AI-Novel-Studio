export interface GenreTropeInfo {
  commonTropes: string[]
  pacingNotes: string
  goldenChapterHook: string
}

// Keyed off the same slugs as lib/genres.ts / app/create/page.tsx (the live
// genre taxonomy actually stored in novel_projects.genre) - not free text.
export const GENRE_TROPE_LIBRARY: Record<string, GenreTropeInfo> = {
  fantasy: {
    commonTropes: ['金手指/系统流', '升级流/境界体系', '扮猪吃虎', '宗门/势力斗争', '寻宝夺宝', '天才少年被打压后逆袭'],
    pacingNotes: '强调力量体系的清晰感与升级的即时反馈，每次突破境界都应伴随爽点',
    goldenChapterHook: '第一章结尾前应埋下"金手指"或身份反差的钩子（如获得神秘传承/系统激活）',
  },
  wuxia: {
    commonTropes: ['江湖恩怨', '武功秘籍争夺', '门派恩怨', '侠义精神', '复仇'],
    pacingNotes: '强调招式对决的画面感与恩怨纠葛的逐步展开',
    goldenChapterHook: '第一章应交代主角的江湖身份危机或血海深仇的引子',
  },
  scifi: {
    commonTropes: ['星际穿越', '文明冲突', '科技悖论', '末日废土', '基因/AI觉醒'],
    pacingNotes: '设定说明要服务于冲突，避免开篇陷入纯科普式铺陈',
    goldenChapterHook: '第一章应用一个具体事件展现科技/文明冲突，而非概念讲解',
  },
  romance: {
    commonTropes: ['欢喜冤家', '身份差距', '双向暗恋', '误会与和解', '救赎'],
    pacingNotes: '节奏可略慢于其他类型，但情感张力（心动/吃醋/心碎）必须每章都有推进',
    goldenChapterHook: '第一章应建立强烈的初见冲突或反差感（如敌对关系/意外接触）',
  },
  urban: {
    commonTropes: ['扮猪吃虎', '低调装逼', '都市异能', '职场逆袭', '打脸爽文', '身份反转'],
    pacingNotes: '强调"被轻视—反转打脸"的爽点循环，冲突要贴近现实职场/社交场景',
    goldenChapterHook: '第一章应展示主角被低估的处境，并暗示其真实实力/背景',
  },
  history: {
    commonTropes: ['穿越改史', '权谋斗争', '战争谋略', '身份伪装'],
    pacingNotes: '权谋线索要环环相扣，每章至少一次立场/联盟的微妙变化',
    goldenChapterHook: '第一章应展现主角面临的历史性危机或身份困境',
  },
  mystery: {
    commonTropes: ['连环案件', '不可能犯罪', '身份反转', '心理博弈'],
    pacingNotes: '每章至少推进一条线索或制造一个新疑点，避免信息量停滞',
    goldenChapterHook: '第一章必须在结尾抛出核心谜题或第一具"尸体/异常事件"',
  },
  horror: {
    commonTropes: ['未知恐惧', '密室/孤立环境', '诡异规则/怪谈', '生存游戏'],
    pacingNotes: '恐惧感依赖"未知"的持续累积，避免过早解释规则',
    goldenChapterHook: '第一章应制造一个无法解释的诡异事件，且不立即解答',
  },
  game: {
    commonTropes: ['虚拟现实', '数值成长', '公会/团队副本', '排行榜竞争'],
    pacingNotes: '数值成长要有清晰可感的节点，配合具体的对抗场景',
    goldenChapterHook: '第一章应展示游戏世界的独特规则与主角的第一次"高光"操作',
  },
  other: {
    commonTropes: [],
    pacingNotes: '保持人物动机清晰、冲突具体，每章都有可感知的推进',
    goldenChapterHook: '第一章应从冲突或异常事件切入，避免大段背景铺垫',
  },
}

export function getGenreTropeInfo(genre: string): GenreTropeInfo {
  return GENRE_TROPE_LIBRARY[genre] ?? GENRE_TROPE_LIBRARY.other
}
