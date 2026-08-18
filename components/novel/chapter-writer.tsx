'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, Sparkles, ChevronLeft, ChevronRight, ArrowRight, 
  RefreshCw, Check, FileText, BookOpen, Download, Save,
  FileDown
} from 'lucide-react'
import { useNovelStore } from '@/lib/store'
import { downloadFile } from '@/lib/utils'
import type { Chapter } from '@/lib/types'

export function ChapterWriter() {
  const { 
    currentProject, 
    updateChapter, 
    setCurrentStep, 
    currentChapterId, 
    setCurrentChapterId,
    isGenerating,
    setIsGenerating
  } = useNovelStore()
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const chapters = currentProject?.chapters || []
  const currentChapter = chapters.find(ch => ch.id === currentChapterId) || chapters[0]
  const currentIndex = chapters.findIndex(ch => ch.id === currentChapter?.id)

  useEffect(() => {
    if (chapters.length > 0 && !currentChapterId) {
      setCurrentChapterId(chapters[0].id)
    }
  }, [chapters, currentChapterId, setCurrentChapterId])

  const generateChapter = useCallback(async () => {
    if (!currentProject || !currentChapter) return
    
    setIsGenerating(true)
    setError(null)
    setStreamingContent('')

    try {
      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentProject.title,
          genre: currentProject.genre,
          structure: currentProject.structure,
          chapter: currentChapter,
          wordsPerChapter: currentProject.wordsPerChapter,
          previousChapter: currentIndex > 0 ? chapters[currentIndex - 1] : null,
          guidance: currentProject.guidance,
        }),
      })

      if (!response.ok) {
        throw new Error('生成章节失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
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
      }

      updateChapter(currentChapter.id, {
        content: fullContent,
        wordCount: fullContent.length,
        status: 'written',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [currentProject, currentChapter, currentIndex, chapters, updateChapter, setIsGenerating])

  const handleSave = () => {
    if (currentChapter && contentRef.current) {
      updateChapter(currentChapter.id, {
        content: contentRef.current.value,
        wordCount: contentRef.current.value.length,
        status: 'revised',
      })
    }
  }

  const exportSingleChapter = (chapter: Chapter) => {
    if (!chapter.content) return
    
    let content = `第 ${chapter.number} 章: ${chapter.title}\n\n`
    content += chapter.content
    
    const filename = `${currentProject?.title || 'novel'}-第${chapter.number}章-${chapter.title}.txt`
    downloadFile(content, filename)
  }

  const goToChapter = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    if (newIndex >= 0 && newIndex < chapters.length) {
      setCurrentChapterId(chapters[newIndex].id)
      setStreamingContent('')
    }
  }

  const completedChapters = chapters.filter(ch => ch.status === 'written' || ch.status === 'revised').length
  const progress = (completedChapters / chapters.length) * 100

  if (!currentProject || chapters.length === 0) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground mb-2">{currentProject.title}</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">完成进度</span>
                <span className="text-foreground">{completedChapters}/{chapters.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`group relative w-full text-left p-3 rounded-lg transition-colors ${
                    chapter.id === currentChapter?.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <button
                    onClick={() => {
                      setCurrentChapterId(chapter.id)
                      setStreamingContent('')
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      chapter.status === 'written' || chapter.status === 'revised'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {chapter.status === 'written' || chapter.status === 'revised' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        chapter.number
                      )}
                    </div>
                    <span className="text-sm truncate mr-6">{chapter.title}</span>
                  </button>
                  
                  {chapter.content && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        exportSingleChapter(chapter)
                      }}
                      title="导出此章节"
                    >
                      <FileDown className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-2">
            <Button 
              className="w-full" 
              onClick={() => setCurrentStep('export')}
              disabled={completedChapters === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              导出小说
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToChapter('prev')}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h3 className="font-semibold text-foreground">
                  第 {currentChapter?.number} 章: {currentChapter?.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentChapter?.content ? `${currentChapter.content.length} 字` : '未写作'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToChapter('next')}
                disabled={currentIndex === chapters.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {currentChapter?.content && (
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  保存修改
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={generateChapter}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {currentChapter?.content ? '重新生成' : '生成内容'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportSingleChapter(currentChapter)}
                disabled={!currentChapter?.content}
              >
                <Download className="w-4 h-4 mr-2" />
                导出本章
              </Button>
            </div>
          </div>

          {/* Chapter Outline */}
          <div className="p-4 bg-secondary/30 border-b border-border">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">章节大纲</p>
                <p className="text-sm text-muted-foreground">{currentChapter?.outline}</p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {error && (
              <Card className="border-destructive/50 bg-destructive/10 mb-4">
                <CardContent className="py-4 text-center">
                  <p className="text-destructive mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={generateChapter}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重试
                  </Button>
                </CardContent>
              </Card>
            )}

            {isGenerating && streamingContent ? (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {streamingContent}
                  <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />
                </div>
              </div>
            ) : currentChapter?.content ? (
              <Textarea
                ref={contentRef}
                defaultValue={currentChapter.content}
                className="min-h-[calc(100vh-300px)] bg-transparent border-0 resize-none text-foreground leading-relaxed text-base focus-visible:ring-0"
                placeholder="章节内容..."
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">准备开始写作</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  点击「生成内容」按钮，AI将根据大纲为您创作本章内容
                </p>
                <Button onClick={generateChapter} disabled={isGenerating}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成第 {currentChapter?.number} 章
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
