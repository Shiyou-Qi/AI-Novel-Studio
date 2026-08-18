'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
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
  FileDown,
  Copy,
  FileType,
  FileJson,
  FileCode,
  FileArchive,
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
}

interface Structure {
  id: string
  world_building: string
  synopsis: string
  themes: string[]
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

  const router = useRouter()
  const supabase = createClient()

  // Generate structure
  const generateStructure = useCallback(async () => {
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
      // Update project status
      await supabase.from('novel_projects').update({ status: 'structuring' }).eq('id', project.id)

      console.log('Saved structure from DB:', savedStructure)
      console.log('Original data from API:', data)
      console.log('worldSetting length:', data.worldSetting?.length)
      console.log('plotSummary length:', data.plotSummary?.length)

      // Use the original API data for state update to ensure completeness
      setStructure({
        id: savedStructure.id,
        world_building: data.worldSetting,  // Use API data directly
        synopsis: data.plotSummary,          // Use API data directly
        themes: data.themes,
      })

      console.log('Structure state updated with lengths:', {
        world_building_length: data.worldSetting?.length,
        synopsis_length: data.plotSummary?.length,
        themes_count: data.themes?.length,
      })
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
      }

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
          .insert(data.chapters.map((c: { title: string; outline: string }, idx: number) => ({
            project_id: project.id,
            chapter_number: startChapter + idx,
            title: c.title,
            outline: c.outline,
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
      const previousChapters = chapters.slice(0, chapterIndex).map(c => ({
        title: c.title,
        summary: c.outline,
      }))

      const requestBody = {
        title: project.title,
        genre: project.genre,
        wordsPerChapter: project.words_per_chapter,
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
        previousChapters,
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

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                setStreamingContent(fullContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{project.title}</h1>
              <p className="text-xs text-muted-foreground">
                {completedChapters}/{chapters.length} 章节 · {totalWords.toLocaleString()} 字
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="hidden md:flex items-center gap-1">
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="text-sm">{step.label}</span>
                  {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1 opacity-50" />}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
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
                  {chapters.map((chapter) => (
                    <Card key={chapter.id} className="bg-card/50 border-border/50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-primary">第{chapter.chapter_number}章</span>
                          {chapter.title}
                          {chapter.status === 'completed' && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{chapter.outline}</p>
                      </CardContent>
                    </Card>
                  ))}
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
                            {chapter.status === 'completed' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            )}
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
