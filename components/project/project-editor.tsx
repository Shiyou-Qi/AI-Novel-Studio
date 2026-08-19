'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useChapterPipeline, type PipelineMode } from '@/hooks/use-chapter-pipeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  ArrowLeft,
  Layers,
  FileText,
  PenTool,
  Download,
  Loader2,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Save,
  RefreshCw,
  Users,
  Globe,
  Target,
  Swords,
  Tags,
  Quote,
  Check,
  FileDown,
  Copy,
  FileType,
  FileJson,
  FileCode,
  FileArchive,
  Bot,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import { downloadFile } from '@/lib/utils'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Project {
  id: string
  title: string
  concept: string
  genre: string
  target_chapters: number
  words_per_chapter: number
  guidance: string | null
  status: string
  blurb?: string | null
  hook_cadence?: number
  pipeline_mode?: PipelineMode
}

interface OutlineChapterData {
  title: string
  outline: string
  beatType: string
  hookNote: string
  isGoldenChapter: boolean
}

interface NewPlotThread {
  title: string
  description: string
  plantedChapter: number
  intendedPayoffChapter: number | null
  importance: 'minor' | 'major'
}

interface ThreadUpdate {
  threadId: string
  status: 'reinforced' | 'paid_off'
  note: string
}

interface GoalLadderStep {
  stage: string
  goal: string
  obstacle: string
  payoff: string
}

interface AntagonistForce {
  name: string
  type: string
  motivation: string
  threatLevel: string
}

interface TitleCandidate {
  title: string
  rationale: string
}

interface Structure {
  id: string
  world_building: string
  synopsis: string
  themes: string[]
  protagonist_goal_ladder?: GoalLadderStep[]
  antagonist_forces?: AntagonistForce[]
  genre_tropes?: string[]
}

interface Character {
  id: string
  name: string
  role: string
  description: string
  motivation: string
}

interface Chapter {
  id: string
  chapter_number: number
  title: string
  outline: string
  content: string
  word_count: number
  status: string
  beat_type?: string | null
  hook_notes?: string | null
  is_golden_chapter?: boolean
  quality_score?: number | null
  needs_review?: boolean
}

interface ProjectEditorProps {
  project: Project
  structure: Structure | null
  characters: Character[]
  chapters: Chapter[]
}

const steps = [
  { key: 'structure', label: '故事架构', icon: Layers },
  { key: 'outline', label: '章节大纲', icon: FileText },
  { key: 'write', label: '章节写作', icon: PenTool },
  { key: 'export', label: '导出', icon: Download },
]

const BEAT_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  setup: { label: '铺垫', className: 'bg-muted text-muted-foreground' },
  rising: { label: '上升', className: 'bg-chart-3/10 text-chart-3' },
  satisfaction: { label: '爽点', className: 'bg-chart-1/10 text-chart-1' },
  suspense: { label: '悬念', className: 'bg-chart-2/10 text-chart-2' },
  twist: { label: '反转', className: 'bg-chart-5/10 text-chart-5' },
  cliffhanger: { label: '悬念钩子', className: 'bg-primary/10 text-primary' },
}

export function ProjectEditor({ project, structure: initialStructure, characters: initialCharacters, chapters: initialChapters }: ProjectEditorProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    if (!initialStructure) return 'structure'
    if (initialChapters.length === 0) return 'outline'
    return 'write'
  })
  const [structure, setStructure] = useState(initialStructure)
  const [characters, setCharacters] = useState(initialCharacters)
  const [chapters, setChapters] = useState(initialChapters)
  const [activeChapter, setActiveChapter] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [generatingProgress, setGeneratingProgress] = useState<string>('')
  const [titleCandidates, setTitleCandidates] = useState<TitleCandidate[]>([])
  const [blurb, setBlurb] = useState<string | null>(project.blurb ?? null)
  const [adoptingTitle, setAdoptingTitle] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const adoptTitle = useCallback(async (title: string) => {
    setAdoptingTitle(title)
    try {
      const { error: titleError } = await supabase
        .from('novel_projects')
        .update({ title })
        .eq('id', project.id)
      if (titleError) throw new Error(titleError.message)
      router.refresh()
    } catch (err) {
      console.error('Error adopting title:', err)
      setError(err instanceof Error ? err.message : '更新书名失败')
    } finally {
      setAdoptingTitle(null)
    }
  }, [project.id, supabase, router])

  // Agent pipeline (Hook Doctor / Continuity Checker / Quality Critic / Reviser)
  const [pipelineMode, setPipelineMode] = useState<PipelineMode>(project.pipeline_mode || 'fast')
  const [pipelineRunCount, setPipelineRunCount] = useState(3)
  const [showPipelineLog, setShowPipelineLog] = useState(false)

  const pipeline = useChapterPipeline({
    supabase,
    projectId: project.id,
    projectTitle: project.title,
    theme: project.concept,
    genre: project.genre,
    wordsPerChapter: project.words_per_chapter,
    guidance: project.guidance,
    structure: {
      worldSetting: structure?.world_building || '',
      plotSummary: structure?.synopsis || '',
      mainCharacters: characters,
    },
    onChapterContentUpdate: (chapterId, content) => {
      setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, content, word_count: content.length } : c))
    },
    onChapterPersisted: (chapterId, patch) => {
      setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, ...patch } : c))
    },
  })

  const changePipelineMode = useCallback(async (mode: PipelineMode) => {
    setPipelineMode(mode)
    await supabase.from('novel_projects').update({ pipeline_mode: mode }).eq('id', project.id)
  }, [project.id, supabase])

  const runPipeline = useCallback(() => {
    const startIdx = activeChapter
    const targets = chapters.slice(startIdx, startIdx + pipelineRunCount)
    if (targets.length === 0) return
    setShowPipelineLog(true)
    pipeline.runRange(targets, pipelineMode)
  }, [activeChapter, chapters, pipelineRunCount, pipelineMode, pipeline])

  // "Continue" from the first not-yet-completed chapter, running everything
  // remaining in one action - the manual range runner above requires
  // re-selecting the right starting chapter and re-clicking every N chapters,
  // which is exactly the gap for a large (e.g. 100-chapter) book.
  const firstIncompleteIndex = chapters.findIndex(c => c.status !== 'completed')
  const remainingChapters = firstIncompleteIndex === -1 ? [] : chapters.slice(firstIncompleteIndex)

  const continuePipeline = useCallback(() => {
    if (remainingChapters.length === 0) return
    setShowPipelineLog(true)
    pipeline.runRange(remainingChapters, pipelineMode)
  }, [remainingChapters, pipelineMode, pipeline])

  // Generate structure
  const generateStructure = useCallback(async () => {
    // Confirm before regenerating: this replaces world/plot/characters on an
    // existing structure (and any accumulated character state in later
    // pipeline phases), matching the same guard already used for outlines.
    if (structure && !window.confirm('重新生成故事架构将覆盖现有的世界观、角色和已选定的书名/简介，确定要重新生成吗？')) {
      return
    }

    setError(null)
    setIsGenerating(true)
    setGeneratingProgress('正在调用 AI 生成故事架构...')

    try {
      const response = await fetch('/api/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          theme: project.concept,
          genre: project.genre,
          targetChapters: project.target_chapters,
          guidance: project.guidance,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to generate structure: ${response.statusText}`)
      }

      setGeneratingProgress('AI 生成完成，正在保存故事架构...')
      const { structure: data } = await response.json()

      console.log('API Response - structure data:', data)
      console.log('worldSetting:', data.worldSetting)
      console.log('plotSummary:', data.plotSummary)
      console.log('themes:', data.themes)
      console.log('mainCharacters:', data.mainCharacters)

      // Check if structure already exists
      const { data: existingStructure } = await supabase
        .from('novel_structures')
        .select('id')
        .eq('project_id', project.id)
        .single()

      let savedStructure
      if (existingStructure) {
        // Update existing structure
        const { data: updated, error: updateError } = await supabase
          .from('novel_structures')
          .update({
            world_setting: data.worldSetting,
            story_synopsis: data.plotSummary,
            themes: data.themes,
            protagonist_goal_ladder: data.protagonistGoalLadder,
            antagonist_forces: data.antagonistForces,
            genre_tropes: data.genreTropes,
          })
          .eq('project_id', project.id)
          .select()
          .single()

        if (updateError) {
          console.error('Supabase Error (Update Structure):', updateError)
          throw new Error(updateError.message)
        }
        savedStructure = updated
      } else {
        // Insert new structure
        const { data: inserted, error: insertError } = await supabase
          .from('novel_structures')
          .insert({
            project_id: project.id,
            world_setting: data.worldSetting,
            story_synopsis: data.plotSummary,
            themes: data.themes,
            protagonist_goal_ladder: data.protagonistGoalLadder,
            antagonist_forces: data.antagonistForces,
            genre_tropes: data.genreTropes,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Supabase Error (Insert Structure):', insertError)
          throw new Error(insertError.message)
        }
        savedStructure = inserted
      }

      // Save characters
      if (data.mainCharacters?.length > 0) {
        setGeneratingProgress('正在保存角色信息...')
        await supabase.from('novel_characters').delete().eq('structure_id', savedStructure.id)

        const { data: savedCharacters, error: charError } = await supabase
          .from('novel_characters')
          .insert(data.mainCharacters.map((c: any) => ({
            structure_id: savedStructure.id,
            name: c.name,
            role: c.role,
            description: c.description,
            motivation: c.motivation,
          })))
          .select()

        if (charError) {
          console.error('Supabase Error (Characters):', charError)
          throw new Error(charError.message)
        }

        // Update characters state
        setCharacters(savedCharacters || [])
      }

      setGeneratingProgress('完成！')
      // Update project status + blurb
      await supabase.from('novel_projects').update({ status: 'structuring', blurb: data.blurb }).eq('id', project.id)

      // Use the original API data for state update to ensure completeness
      setStructure({
        id: savedStructure.id,
        world_building: data.worldSetting,  // Use API data directly
        synopsis: data.plotSummary,          // Use API data directly
        themes: data.themes,
        protagonist_goal_ladder: data.protagonistGoalLadder || [],
        antagonist_forces: data.antagonistForces || [],
        genre_tropes: data.genreTropes || [],
      })
      setTitleCandidates(data.titleCandidates || [])
      setBlurb(data.blurb || null)
    } catch (error) {
      console.error('Error generating structure:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        setError(error.message)
      } else {
        console.error('Unknown error object:', JSON.stringify(error, null, 2))
        setError('生成故事架构失败，请重试')
      }
    } finally {
      setIsGenerating(false)
      setGeneratingProgress('')
    }
  }, [project, supabase])

  // Generate outline
  const generateOutline = useCallback(async (options: { isResume?: boolean } = {}) => {
    const isResume = options.isResume === true

    if (!structure) {
      console.error('No structure available')
      setError('请先生成故事架构')
      return
    }

    if (!characters || characters.length === 0) {
      console.warn('No characters available')
      setError('故事架构中没有角色信息，请重新生成故事架构')
      return
    }

    // If chapters already exist and not resuming, confirm before regenerating
    if (chapters.length > 0 && !isResume) {
      const confirm = window.confirm('重新生成大纲将删除所有现有章节及已写内容，确定要重新生成吗？')
      if (!confirm) return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const totalChapters = project.target_chapters
      const batchSize = 10
      const currentChapterCount = isResume ? chapters.length : 0
      const remainingChapters = totalChapters - currentChapterCount

      if (remainingChapters <= 0) {
        setGeneratingProgress('所有大纲已生成完成')
        setIsGenerating(false)
        return
      }

      const batches = Math.ceil(remainingChapters / batchSize)
      let allChapters = isResume ? [...chapters] : []

      // Only delete if not resuming
      if (!isResume) {
        await supabase.from('novel_chapters').delete().eq('project_id', project.id)
        await supabase.from('novel_plot_threads').delete().eq('project_id', project.id)
      }

      // Open plot threads accumulate across batches within this run (new
      // threads planted in batch N are visible to batch N+1's prompt), and
      // start from whatever's already open in the DB when resuming.
      const { data: existingThreads } = await supabase
        .from('novel_plot_threads')
        .select('id, title, description')
        .eq('project_id', project.id)
        .in('status', ['planted', 'reinforced'])
      let openThreads = (existingThreads || []).map(t => ({ id: t.id, title: t.title, description: t.description || '' }))

      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const startChapter = currentChapterCount + batchIndex * batchSize + 1
        const endChapter = Math.min(currentChapterCount + (batchIndex + 1) * batchSize, totalChapters)
        const chaptersInBatch = endChapter - startChapter + 1

        setGeneratingProgress(`正在生成第 ${startChapter}-${endChapter} 章大纲 (${batchIndex + 1}/${batches})...`)

        const requestBody = {
          title: project.title,
          theme: project.concept,
          genre: project.genre,
          targetChapters: chaptersInBatch,
          startChapter: startChapter,
          totalChapters: totalChapters,
          guidance: project.guidance,
          hookCadence: project.hook_cadence || 3,
          openThreads,
          structure: {
            worldSetting: structure.world_building,
            plotSummary: structure.synopsis,
            themes: structure.themes,
            mainCharacters: characters,
          },
          previousChapters: allChapters.map(c => ({ number: c.chapter_number, title: c.title, outline: c.outline })),
        }

        console.log(`Batch ${batchIndex + 1}/${batches}: Generating chapters ${startChapter}-${endChapter}`)

        const response = await fetch('/api/generate-outline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('API Error Response:', errorData)
          const errorMessage = errorData.error || errorData.details || `生成失败 (${response.status})`
          throw new Error(errorMessage)
        }

        const data = await response.json()

        // 保存这批章节
        setGeneratingProgress(`正在保存第 ${startChapter}-${endChapter} 章...`)
        const { data: savedChapters, error: saveError } = await supabase
          .from('novel_chapters')
          .insert(data.chapters.map((c: OutlineChapterData, idx: number) => ({
            project_id: project.id,
            chapter_number: startChapter + idx,
            title: c.title,
            outline: c.outline,
            // Defensive fallback: the schema layer already coerces these,
            // but is_golden_chapter is NOT NULL in the DB - never let a
            // gap here turn into a failed insert for the whole batch.
            beat_type: c.beatType ?? null,
            hook_notes: c.hookNote ?? null,
            is_golden_chapter: c.isGoldenChapter ?? false,
            content: '',
            word_count: 0,
            status: 'pending',
          })))
          .select()

        if (saveError) {
          console.error('Save error:', saveError)
          throw new Error('保存章节失败')
        }

        allChapters = [...allChapters, ...(savedChapters || [])]

        // 更新UI显示已生成的章节
        setChapters(allChapters)

        // 保存新伏笔 + 更新已有伏笔状态
        if (data.newPlotThreads?.length > 0) {
          const { data: insertedThreads } = await supabase
            .from('novel_plot_threads')
            .insert(data.newPlotThreads.map((t: NewPlotThread) => ({
              project_id: project.id,
              title: t.title,
              description: t.description,
              planted_chapter: t.plantedChapter,
              intended_payoff_chapter: t.intendedPayoffChapter,
              importance: t.importance,
            })))
            .select('id, title, description')
          if (insertedThreads) {
            openThreads = [...openThreads, ...insertedThreads.map(t => ({ id: t.id, title: t.title, description: t.description || '' }))]
          }
        }

        if (data.threadUpdates?.length > 0) {
          for (const update of data.threadUpdates as ThreadUpdate[]) {
            // Defensive: only trust threadIds we actually handed the model as
            // open threads, since the model could otherwise invent one.
            if (!openThreads.some(t => t.id === update.threadId)) continue
            await supabase
              .from('novel_plot_threads')
              .update({
                status: update.status,
                actual_payoff_chapter: update.status === 'paid_off' ? endChapter : undefined,
              })
              .eq('id', update.threadId)
            if (update.status === 'paid_off') {
              openThreads = openThreads.filter(t => t.id !== update.threadId)
            }
          }
        }
      }

      setGeneratingProgress('完成！')
      // Update project status
      await supabase.from('novel_projects').update({ status: 'outlining' }).eq('id', project.id)
      if (allChapters.length >= totalChapters) {
        setCurrentStep('write')
      }
    } catch (error) {
      console.error('Error generating outline:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('生成大纲失败，请重试')
      }
    } finally {
      setIsGenerating(false)
      setGeneratingProgress('')
    }
  }, [project, structure, chapters, characters, supabase])

  // Generate chapter content
  const generateChapter = useCallback(async (chapterIndex: number) => {
    const chapter = chapters[chapterIndex]
    if (!chapter || !structure) return

    setError(null)
    setIsGenerating(true)
    setStreamingContent('')
    setGeneratingProgress(`正在生成第 ${chapter.chapter_number} 章内容...`)

    try {
      const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null
      const previousChapter = prevChapter ? {
        number: prevChapter.chapter_number,
        title: prevChapter.title,
        outline: prevChapter.outline,
      } : undefined

      const requestBody = {
        title: project.title,
        theme: project.concept,
        genre: project.genre,
        wordsPerChapter: project.words_per_chapter,
        guidance: project.guidance,
        structure: {
          worldSetting: structure.world_building,
          synopsis: structure.synopsis,
          mainCharacters: characters, // 确保字段名与 generate-chapter API 一致
        },
        chapter: {
          number: chapter.chapter_number,
          title: chapter.title,
          outline: chapter.outline,
        },
        previousChapter,
      }

      console.log(`Generating chapter ${chapter.chapter_number}:`, chapter.title)

      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || errorData.details || `生成失败 (${response.status})`)
      }
      
      if (!response.body) throw new Error('服务器未返回内容')

      setGeneratingProgress(`正在接收第 ${chapter.chapter_number} 章内容...`)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        fullContent += decoder.decode(value, { stream: true })
        setStreamingContent(fullContent)
      }

      setGeneratingProgress(`正在保存第 ${chapter.chapter_number} 章...`)

      // Save chapter content
      const wordCount = fullContent.length
      await supabase
        .from('novel_chapters')
        .update({
          content: fullContent,
          word_count: wordCount,
          status: 'completed',
        })
        .eq('id', chapter.id)

      // Update local state
      setChapters(prev => prev.map((c, idx) =>
        idx === chapterIndex
          ? { ...c, content: fullContent, word_count: wordCount, status: 'completed' }
          : c
      ))

      // Update project status
      const completedCount = chapters.filter((c, idx) =>
        idx === chapterIndex || c.status === 'completed'
      ).length

      if (completedCount === chapters.length) {
        await supabase.from('novel_projects').update({ status: 'completed' }).eq('id', project.id)
      } else {
        await supabase.from('novel_projects').update({ status: 'writing' }).eq('id', project.id)
      }

      setStreamingContent('')
    } catch (error) {
      console.error('Error generating chapter:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('生成章节失败，请重试')
      }
    } finally {
      setIsGenerating(false)
    }
  }, [chapters, structure, characters, project, supabase])

  // Save chapter content
  const saveChapter = useCallback(async (chapterIndex: number, content: string) => {
    const chapter = chapters[chapterIndex]
    if (!chapter) return

    setIsSaving(true)
    try {
      await supabase
        .from('novel_chapters')
        .update({
          content,
          word_count: content.length,
        })
        .eq('id', chapter.id)

      setChapters(prev => prev.map((c, idx) =>
        idx === chapterIndex
          ? { ...c, content, word_count: content.length }
          : c
      ))
    } catch (error) {
      console.error('Error saving chapter:', error)
    } finally {
      setIsSaving(false)
    }
  }, [chapters, supabase])

  // Export functions
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('内容已复制到剪贴板')
    }).catch(() => {
      toast.error('复制失败，请重试')
    })
  }

  const exportSingleChapterAsWord = async (chapter: Chapter) => {
    if (!chapter.content) return
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `第 ${chapter.chapter_number} 章 ${chapter.title}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
          }),
          ...chapter.content.split('\n').map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 24 })],
            spacing: { line: 360, after: 200 },
          })),
        ],
      }],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${project.title}-第${chapter.chapter_number}章-${chapter.title}.docx`)
  }

  const exportSingleChapter = (chapter: Chapter, format: 'txt' | 'md' | 'json' | 'docx' | 'copy') => {
    if (!chapter.content) return

    if (format === 'copy') {
      copyToClipboard(chapter.content)
      return
    }

    if (format === 'docx') {
      exportSingleChapterAsWord(chapter)
      return
    }

    let content = ''
    let filename = `${project.title}-第${chapter.chapter_number}章-${chapter.title}`
    let mimeType = 'text/plain'

    switch (format) {
      case 'txt':
        content = `第${chapter.chapter_number}章 ${chapter.title}\n\n${chapter.content}`
        filename += '.txt'
        mimeType = 'text/plain'
        break
      case 'md':
        content = `# 第${chapter.chapter_number}章 ${chapter.title}\n\n${chapter.content}`
        filename += '.md'
        mimeType = 'text/markdown'
        break
      case 'json':
        content = JSON.stringify({
          project: project.title,
          chapter: chapter.chapter_number,
          title: chapter.title,
          content: chapter.content
        }, null, 2)
        filename += '.json'
        mimeType = 'application/json'
        break
    }

    downloadFile(content, filename, mimeType)
  }

  const exportAsText = () => {
    let content = `${project.title}\n${'='.repeat(project.title.length)}\n\n`
    chapters.forEach((chapter) => {
      content += `第${chapter.chapter_number}章 ${chapter.title}\n\n${chapter.content}\n\n`
    })
    downloadFile(content, `${project.title}.txt`, 'text/plain')
  }

  const exportAsMarkdown = () => {
    let content = `# ${project.title}\n\n`
    if (structure) {
      content += `## 故事简介\n\n${structure.synopsis}\n\n`
    }
    chapters.forEach((chapter) => {
      content += `## 第${chapter.chapter_number}章 ${chapter.title}\n\n${chapter.content}\n\n`
    })
    downloadFile(content, `${project.title}.md`, 'text/markdown')
  }

  const exportAsJSON = () => {
    const data = {
      project: {
        title: project.title,
        genre: project.genre,
        concept: project.concept,
      },
      structure,
      characters,
      chapters: chapters.map(c => ({
        number: c.chapter_number,
        title: c.title,
        content: c.content,
      })),
    }
    downloadFile(JSON.stringify(data, null, 2), `${project.title}.json`, 'application/json')
  }

  const exportAsWord = async () => {
    const sections = []

    // 1. 封面页
    sections.push({
      properties: {},
      children: [
        new Paragraph({
          text: project.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { before: 2400, after: 1200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: project.genre || '未分类',
              size: 28,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `总字数：${totalWords.toLocaleString()} 字`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
    })

    // 2. 章节内容
    const chapterParagraphs: Paragraph[] = []
    chapters.forEach((chapter) => {
      // 章节标题
      chapterParagraphs.push(
        new Paragraph({
          text: `第 ${chapter.chapter_number} 章 ${chapter.title}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 400 },
          pageBreakBefore: true, // 每个章节从新的一页开始
        })
      )

      // 章节大纲（作为参考，可选）
      if (chapter.outline) {
        chapterParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '【本章大纲】',
                bold: true,
                color: '666666',
              }),
              new TextRun({
                text: chapter.outline,
                color: '666666',
              }),
            ],
            spacing: { after: 400 },
          })
        )
      }

      // 章节正文
      if (chapter.content) {
        const lines = chapter.content.split('\n')
        lines.forEach(line => {
          if (line.trim()) {
            chapterParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line.trim(),
                    size: 24, // 12pt
                  }),
                ],
                indent: { firstLine: 480 }, // 首行缩进两个字符 (24pt * 20 = 480 twips)
                spacing: { line: 360, after: 200 }, // 1.5倍行间距
              })
            )
          }
        })
      } else {
        chapterParagraphs.push(
          new Paragraph({
            text: '（暂无正文内容）',
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
          })
        )
      }
    })

    sections.push({
      properties: {},
      children: chapterParagraphs,
    })

    const doc = new Document({
      sections: sections,
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${project.title}.docx`)
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentChapter = chapters[activeChapter]
  const completedChapters = chapters.filter(c => c.status === 'completed').length
  const totalWords = chapters.reduce((sum, c) => sum + c.word_count, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground text-[15px] truncate">{project.title}</h1>
              <p className="text-xs text-muted-foreground tabular-nums">
                {completedChapters}/{chapters.length} 章节 · {totalWords.toLocaleString()} 字
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.key
              const isPast = steps.findIndex(s => s.key === currentStep) > idx
              return (
                <button
                  key={step.key}
                  onClick={() => {
                    if (step.key === 'structure' || (step.key === 'outline' && structure) ||
                      (step.key === 'write' && chapters.length > 0) ||
                      (step.key === 'export' && chapters.some(c => c.content))) {
                      setCurrentStep(step.key)
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                >
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  <span>{step.label}</span>
                  {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-0.5 opacity-40" />}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Structure Step */}
        {currentStep === 'structure' && (
          <div className="space-y-6">
            {error && (
              <Card className="bg-destructive/10 border-destructive/50">
                <CardContent className="pt-6">
                  <p className="text-destructive text-center">{error}</p>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => setError(null)}>
                      关闭
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {!structure ? (
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <CardTitle>生成故事架构</CardTitle>
                  <CardDescription>
                    AI将根据您的设定生成完整的故事世界观、角色体系和情节框架
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Button onClick={generateStructure} disabled={isGenerating} size="lg">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        开始生成
                      </>
                    )}
                  </Button>
                  {isGenerating && generatingProgress && (
                    <p className="text-sm text-muted-foreground animate-pulse">{generatingProgress}</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {(titleCandidates.length > 0 || blurb) && (
                  <Card className="lg:col-span-2 bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Quote className="w-5 h-5 text-primary" />
                        书名与简介
                      </CardTitle>
                      <CardDescription>AI 生成的备选书名与一句话简介，点击书名即可采用</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {blurb && (
                        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">
                          {blurb}
                        </p>
                      )}
                      {titleCandidates.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {titleCandidates.map((candidate) => {
                            const isCurrent = candidate.title === project.title
                            return (
                              <button
                                key={candidate.title}
                                type="button"
                                onClick={() => !isCurrent && adoptTitle(candidate.title)}
                                disabled={adoptingTitle !== null}
                                title={candidate.rationale}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${isCurrent
                                  ? 'bg-primary/10 border-primary/50 text-primary'
                                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                                  }`}
                              >
                                {isCurrent && <Check className="w-3.5 h-3.5" />}
                                {adoptingTitle === candidate.title ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  candidate.title
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      世界观设定
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{structure.world_building}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      故事梗概
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{structure.synopsis}</p>
                    {structure.themes?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {structure.themes.map((theme, idx) => (
                          <Badge key={idx} variant="secondary">{theme}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      主要角色
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {characters.map((char) => (
                        <div key={char.id} className="p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{char.name}</h4>
                            <Badge variant="outline" className="text-xs">{char.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{char.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">动机：</span>{char.motivation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {((structure.protagonist_goal_ladder?.length ?? 0) > 0 || (structure.antagonist_forces?.length ?? 0) > 0) && (
                  <Card className="lg:col-span-2 bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        情节设计
                      </CardTitle>
                      <CardDescription>目标阶梯与对立势力，用于后续大纲与章节生成的节奏参考</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {structure.genre_tropes && structure.genre_tropes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Tags className="w-4 h-4 text-muted-foreground" />
                          {structure.genre_tropes.map((trope, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{trope}</Badge>
                          ))}
                        </div>
                      )}

                      {structure.protagonist_goal_ladder && structure.protagonist_goal_ladder.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" /> 主角目标阶梯
                          </h4>
                          <div className="space-y-2">
                            {structure.protagonist_goal_ladder.map((step, idx) => (
                              <div key={idx} className="flex gap-3 text-sm p-3 bg-secondary/30 rounded-lg">
                                <span className="text-primary font-medium shrink-0">{idx + 1}.</span>
                                <div className="min-w-0">
                                  <p className="text-foreground">
                                    <span className="text-muted-foreground">[{step.stage}]</span> {step.goal}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    阻碍：{step.obstacle} · 爽点：{step.payoff}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {structure.antagonist_forces && structure.antagonist_forces.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5" /> 对立势力
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {structure.antagonist_forces.map((force, idx) => (
                              <div key={idx} className="p-3 bg-secondary/30 rounded-lg text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-foreground">{force.name}</span>
                                  <Badge variant="outline" className="text-xs">{force.threatLevel}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{force.motivation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="lg:col-span-2 flex justify-between">
                  <Button variant="outline" onClick={generateStructure} disabled={isGenerating}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新生成
                  </Button>
                  <Button onClick={() => setCurrentStep('outline')}>
                    下一步：生成大纲
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Outline Step */}
        {currentStep === 'outline' && (
          <div className="space-y-6">
            {error && (
              <Card className="bg-destructive/10 border-destructive/50">
                <CardContent className="pt-6">
                  <p className="text-destructive text-center">{error}</p>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => setError(null)}>
                      关闭
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {chapters.length === 0 ? (
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>生成章节大纲</CardTitle>
                  <CardDescription>
                    AI将根据故事架构生成 {project.target_chapters} 个章节的详细大纲
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Button onClick={() => generateOutline({ isResume: false })} disabled={isGenerating} size="lg">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        开始生成
                      </>
                    )}
                  </Button>
                  {isGenerating && generatingProgress && (
                    <p className="text-sm text-muted-foreground animate-pulse">{generatingProgress}</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">章节大纲</h2>
                  <div className="flex items-center gap-2">
                    {isGenerating && generatingProgress && (
                      <p className="text-sm text-muted-foreground animate-pulse mr-4">{generatingProgress}</p>
                    )}
                    {chapters.length < project.target_chapters && (
                      <Button variant="default" onClick={() => generateOutline({ isResume: true })} disabled={isGenerating}>
                        <Sparkles className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                        继续生成 ({chapters.length}/{project.target_chapters})
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => generateOutline({ isResume: false })} disabled={isGenerating}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                      重新生成
                    </Button>
                    <Button onClick={() => setCurrentStep('write')}>
                      开始写作
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3">
                  {chapters.map((chapter) => {
                    const beat = chapter.beat_type ? BEAT_TYPE_LABELS[chapter.beat_type] : null
                    return (
                      <Card key={chapter.id} className="bg-card/50 border-border/50">
                        <CardHeader className="py-3">
                          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                            <span className="text-primary">第{chapter.chapter_number}章</span>
                            {chapter.title}
                            {chapter.is_golden_chapter && (
                              <Badge className="text-xs font-normal bg-accent/10 text-accent">
                                <Sparkles className="w-3 h-3 mr-1" /> 黄金三章
                              </Badge>
                            )}
                            {beat && (
                              <Badge className={`text-xs font-normal ${beat.className}`}>{beat.label}</Badge>
                            )}
                            {chapter.status === 'completed' && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-1.5">
                          <p className="text-sm text-muted-foreground">{chapter.outline}</p>
                          {chapter.hook_notes && (
                            <p className="text-xs text-muted-foreground/80 italic">钩子：{chapter.hook_notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Write Step */}
        {currentStep === 'write' && chapters.length > 0 && (
          <div className="space-y-4">
            {error && (
              <Card className="bg-destructive/10 border-destructive/50">
                <CardContent className="pt-6">
                  <p className="text-destructive text-center">{error}</p>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => setError(null)}>
                      关闭
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agent pipeline controls */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  Agent 流水线
                </CardTitle>
                <CardDescription>
                  从当前章节开始，依次起草并（精品模式下）自动检查钩子、连贯性与质量，必要时自动修订
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex rounded-lg border border-border/50 p-0.5">
                    <button
                      type="button"
                      onClick={() => changePipelineMode('fast')}
                      disabled={pipeline.isRunning}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${pipelineMode === 'fast' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      快速模式
                    </button>
                    <button
                      type="button"
                      onClick={() => changePipelineMode('quality')}
                      disabled={pipeline.isRunning}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${pipelineMode === 'quality' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      精品模式
                    </button>
                  </div>

                  {pipeline.isRunning ? (
                    <Button variant="destructive" size="sm" onClick={pipeline.stop}>
                      <Square className="w-3.5 h-3.5 mr-2" />
                      停止
                    </Button>
                  ) : remainingChapters.length > 0 ? (
                    <Button size="sm" onClick={continuePipeline}>
                      <Play className="w-3.5 h-3.5 mr-2" />
                      继续写作剩余 {remainingChapters.length} 章
                    </Button>
                  ) : (
                    <Button size="sm" disabled>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                      全部章节已完成
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={() => setShowPipelineLog(v => !v)}>
                    {showPipelineLog ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                    进度日志 {pipeline.log.length > 0 && `(${pipeline.log.length})`}
                  </Button>
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none">
                    手动指定起始章节与数量
                  </summary>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-muted-foreground">从第 {currentChapter?.chapter_number} 章（当前选中）开始，运行</span>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={pipelineRunCount}
                      onChange={(e) => setPipelineRunCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
                      disabled={pipeline.isRunning}
                      className="w-16 h-8 bg-background/50"
                    />
                    <span className="text-muted-foreground">章</span>
                    <Button size="sm" variant="outline" onClick={runPipeline} disabled={pipeline.isRunning}>
                      运行
                    </Button>
                  </div>
                </details>

                {pipeline.isRunning && pipeline.currentLabel && (
                  <p className="text-sm text-primary animate-pulse">{pipeline.currentLabel}</p>
                )}

                {showPipelineLog && pipeline.log.length > 0 && (
                  <ScrollArea className="h-40 rounded-lg border border-border/50 bg-secondary/20 p-3">
                    <div className="space-y-1 text-xs font-mono">
                      {pipeline.log.map((entry, idx) => (
                        <div key={idx} className="text-muted-foreground">
                          <span className="text-primary">第{entry.chapterNumber}章</span>
                          {' '}
                          <span className="text-foreground">[{entry.stage}]</span>
                          {' '}{entry.message}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-6 min-h-[calc(100vh-16rem)]">
              {/* Chapter list sidebar */}
              <Card className="w-64 flex-shrink-0 bg-card/50 border-border/50 sticky top-24 h-[calc(100vh-10rem)]">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">章节列表</CardTitle>
                </CardHeader>
                <ScrollArea className="h-[calc(100%-4rem)]">
                  <div className="p-2 space-y-1">
                    {chapters.map((chapter, idx) => (
                      <div
                        key={chapter.id}
                        onClick={() => setActiveChapter(idx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${activeChapter === idx
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary/50'
                          }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setActiveChapter(idx)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">第{chapter.chapter_number}章</span>
                          <div className="flex items-center gap-1">
                            {typeof chapter.quality_score === 'number' && (
                              <span
                                title={`质量评分：${chapter.quality_score}/100`}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${chapter.quality_score >= 70 ? 'bg-chart-1/10 text-chart-1' : 'bg-amber-500/10 text-amber-500'}`}
                              >
                                {chapter.quality_score}
                              </span>
                            )}
                            {chapter.needs_review && (
                              <span title="待人工复核">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              </span>
                            )}
                            {chapter.status === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            ) : chapter.status !== 'pending' ? (
                              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
                            ) : null}
                            {chapter.content && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="导出或复制"
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuLabel>章节操作</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    exportSingleChapter(chapter, 'copy')
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    复制内容
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>导出格式</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    exportSingleChapter(chapter, 'docx')
                                  }}>
                                    <FileArchive className="w-4 h-4 mr-2" />
                                    Word (.docx)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    exportSingleChapter(chapter, 'txt')
                                  }}>
                                    <FileType className="w-4 h-4 mr-2" />
                                    纯文本 (.txt)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    exportSingleChapter(chapter, 'md')
                                  }}>
                                    <FileCode className="w-4 h-4 mr-2" />
                                    Markdown (.md)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    exportSingleChapter(chapter, 'json')
                                  }}>
                                    <FileJson className="w-4 h-4 mr-2" />
                                    JSON (.json)
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        <p className="text-xs opacity-70 truncate">{chapter.title}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Editor area */}
              <Card className="flex-1 bg-card/50 border-border/50 flex flex-col">
                <CardHeader className="py-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        第{currentChapter?.chapter_number}章 {currentChapter?.title}
                      </CardTitle>
                      <CardDescription>{currentChapter?.outline}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveChapter(activeChapter, currentChapter?.content || '')}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span className="ml-2">保存</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => generateChapter(activeChapter)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span className="ml-2">{currentChapter?.content ? '重新生成' : 'AI生成'}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!currentChapter?.content}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            导出/复制
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>章节操作</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => exportSingleChapter(currentChapter, 'copy')}>
                            <Copy className="w-4 h-4 mr-2" />
                            复制本章内容
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>导出本章为</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => exportSingleChapter(currentChapter, 'docx')}>
                            <FileArchive className="w-4 h-4 mr-2" />
                            Word 文档 (.docx)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportSingleChapter(currentChapter, 'txt')}>
                            <FileType className="w-4 h-4 mr-2" />
                            纯文本文件 (.txt)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportSingleChapter(currentChapter, 'md')}>
                            <FileCode className="w-4 h-4 mr-2" />
                            Markdown 格式 (.md)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportSingleChapter(currentChapter, 'json')}>
                            <FileJson className="w-4 h-4 mr-2" />
                            JSON 数据 (.json)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  <Textarea
                    value={streamingContent || currentChapter?.content || ''}
                    onChange={(e) => {
                      if (!isGenerating) {
                        setChapters(prev => prev.map((c, idx) =>
                          idx === activeChapter ? { ...c, content: e.target.value } : c
                        ))
                      }
                    }}
                    placeholder="点击 AI生成 按钮开始创作，或直接输入内容..."
                    className="flex-1 min-h-[600px] resize-none border-0 rounded-none focus-visible:ring-0 bg-transparent p-8 text-lg leading-relaxed overflow-y-auto font-serif"
                    disabled={isGenerating}
                  />
                </CardContent>
                <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>字数：{(streamingContent || currentChapter?.content || '').length}</span>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('export')}>
                    完成后导出
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Export Step */}
        {currentStep === 'export' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>导出你的小说</CardTitle>
                <CardDescription>
                  选择格式导出完整作品
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{completedChapters}/{chapters.length}</p>
                    <p className="text-xs text-muted-foreground">已完成章节</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalWords.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">总字数</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {chapters.length > 0 ? Math.round(totalWords / chapters.length).toLocaleString() : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">平均字数/章</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Button variant="default" className="justify-start h-auto py-4 bg-primary hover:bg-primary/90" onClick={exportAsWord}>
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">导出为 Word 文档 (.docx)</p>
                      <p className="text-xs opacity-80">完整小说格式，包含封面、章节标题和正文缩进</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-4 bg-transparent" onClick={exportAsText}>
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">纯文本格式 (.txt)</p>
                      <p className="text-xs text-muted-foreground">简洁的纯文本，适合阅读</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-4 bg-transparent" onClick={exportAsMarkdown}>
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Markdown格式 (.md)</p>
                      <p className="text-xs text-muted-foreground">带格式的文本，适合二次编辑</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-4 bg-transparent" onClick={exportAsJSON}>
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">JSON格式 (.json)</p>
                      <p className="text-xs text-muted-foreground">结构化数据，适合程序处理</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">内容预览</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="0">
                  <TabsList className="mb-4">
                    {chapters.slice(0, 5).map((chapter, idx) => (
                      <TabsTrigger key={chapter.id} value={String(idx)}>
                        第{chapter.chapter_number}章
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {chapters.slice(0, 5).map((chapter, idx) => (
                    <TabsContent key={chapter.id} value={String(idx)}>
                      <ScrollArea className="h-[400px] border rounded-md p-4 bg-secondary/10">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <h3 className="text-xl font-bold mb-4">{chapter.title}</h3>
                          <p className="whitespace-pre-wrap leading-relaxed">{chapter.content || '暂无内容'}</p>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
