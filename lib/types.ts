export interface NovelProject {
  id: string
  title: string
  theme: string
  genre: NovelGenre
  targetChapters: number
  wordsPerChapter: number
  guidance?: string
  createdAt: Date
  updatedAt: Date
  status: ProjectStatus
  structure?: NovelStructure
  chapters: Chapter[]
}

export type NovelGenre =
  | '玄幻'
  | '武侠'
  | '都市'
  | '言情'
  | '科幻'
  | '悬疑'
  | '历史'
  | '奇幻'
  | '恐怖'
  | '其他'

export type ProjectStatus = 'draft' | 'planning' | 'writing' | 'completed'

export interface NovelStructure {
  worldSetting: string
  mainCharacters: Character[]
  plotSummary: string
  themes: string[]
  timeline: string
}

export interface Character {
  name: string
  role: string
  description: string
  motivation: string
}

export interface Chapter {
  id: string
  number: number
  title: string
  outline: string
  content: string
  wordCount: number
  status: ChapterStatus
}

export type ChapterStatus = 'outline' | 'draft' | 'written' | 'revised'

export interface ProjectFormData {
  title: string
  theme: string
  genre: NovelGenre
  targetChapters: number
  wordsPerChapter: number
  guidance: string
}

export const GENRE_OPTIONS: { value: NovelGenre; label: string; description: string }[] = [
  { value: '玄幻', label: '玄幻', description: '异世界、修炼体系、法术' },
  { value: '武侠', label: '武侠', description: '江湖恩怨、武功秘籍' },
  { value: '都市', label: '都市', description: '现代城市、职场生活' },
  { value: '言情', label: '言情', description: '爱情故事、情感纠葛' },
  { value: '科幻', label: '科幻', description: '未来科技、太空冒险' },
  { value: '悬疑', label: '悬疑', description: '推理破案、惊悚悬念' },
  { value: '历史', label: '历史', description: '历史背景、朝代故事' },
  { value: '奇幻', label: '奇幻', description: '魔法世界、奇异生物' },
  { value: '恐怖', label: '恐怖', description: '惊悚恐怖、灵异事件' },
  { value: '其他', label: '其他', description: '自定义类型' },
]
