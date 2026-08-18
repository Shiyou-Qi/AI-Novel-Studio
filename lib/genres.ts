export interface GenreOption {
  value: string
  label: string
  description: string
}

// Canonical genre list — value slugs must match what app/create/page.tsx writes
// into novel_projects.genre, since this also backs lib/ai/genre-tropes.ts.
export const GENRE_OPTIONS: GenreOption[] = [
  { value: 'fantasy', label: '玄幻', description: '异世界、修炼体系、法术' },
  { value: 'wuxia', label: '武侠', description: '江湖恩怨、武功秘籍' },
  { value: 'scifi', label: '科幻', description: '未来科技、太空冒险' },
  { value: 'romance', label: '言情', description: '爱情故事、情感纠葛' },
  { value: 'urban', label: '都市', description: '现代城市、职场生活' },
  { value: 'history', label: '历史', description: '历史背景、朝代故事' },
  { value: 'mystery', label: '悬疑', description: '推理破案、惊悚悬念' },
  { value: 'horror', label: '恐怖', description: '惊悚恐怖、灵异事件' },
  { value: 'game', label: '游戏', description: '虚拟世界、升级闯关' },
  { value: 'other', label: '其他', description: '自定义类型' },
]
