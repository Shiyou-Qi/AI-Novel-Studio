'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles, List, ArrowRight, RefreshCw, Check, Edit2 } from 'lucide-react'
import { useNovelStore } from '@/lib/store'
import type { Chapter } from '@/lib/types'

export function ChapterOutline() {
  const { currentProject, addChapters, setCurrentStep, isGenerating, setIsGenerating } = useNovelStore()
  const [chapters, setChapters] = useState<Chapter[]>(currentProject?.chapters || [])
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const generateOutline = useCallback(async () => {
    if (!currentProject || !currentProject.structure) return
    
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentProject.title,
          theme: currentProject.theme,
          genre: currentProject.genre,
          structure: currentProject.structure,
          targetChapters: currentProject.targetChapters,
          guidance: currentProject.guidance,
        }),
      })

      if (!response.ok) {
        throw new Error('生成大纲失败')
      }

      const data = await response.json()
      setChapters(data.chapters)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [currentProject, setIsGenerating])

  const handleConfirm = () => {
    if (chapters.length > 0) {
      addChapters(chapters)
      setCurrentStep('write')
    }
  }

  const updateChapterField = (id: string, field: keyof Chapter, value: string) => {
    setChapters(chapters.map(ch => 
      ch.id === id ? { ...ch, [field]: value } : ch
    ))
  }

  if (!currentProject) return null

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{currentProject.title}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-foreground">章节大纲</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">章节大纲</h1>
          <p className="text-muted-foreground">
            基于故事架构生成 {currentProject.targetChapters} 章的详细大纲
          </p>
        </div>

        {chapters.length === 0 && !isGenerating && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <List className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">准备生成章节大纲</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                AI将根据故事架构，为您规划 {currentProject.targetChapters} 章的详细大纲
              </p>
              <Button size="lg" onClick={generateOutline}>
                <Sparkles className="w-4 h-4 mr-2" />
                生成大纲
              </Button>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="py-16 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-semibold mb-2">正在生成章节大纲...</h2>
              <p className="text-muted-foreground">AI正在规划每一章的精彩内容</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={generateOutline}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
            </CardContent>
          </Card>
        )}

        {chapters.length > 0 && !isGenerating && (
          <div className="space-y-6">
            <div className="grid gap-4">
              {chapters.map((chapter, index) => (
                <Card key={chapter.id} className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                          {chapter.number}
                        </div>
                        {editingId === chapter.id ? (
                          <Input
                            value={chapter.title}
                            onChange={(e) => updateChapterField(chapter.id, 'title', e.target.value)}
                            className="font-semibold bg-input/50"
                            onBlur={() => setEditingId(null)}
                            autoFocus
                          />
                        ) : (
                          <CardTitle 
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setEditingId(chapter.id)}
                          >
                            {chapter.title}
                          </CardTitle>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(editingId === chapter.id ? null : chapter.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingId === chapter.id ? (
                      <Textarea
                        value={chapter.outline}
                        onChange={(e) => updateChapterField(chapter.id, 'outline', e.target.value)}
                        className="min-h-[100px] bg-input/50"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {chapter.outline}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={generateOutline}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
              <Button size="lg" onClick={handleConfirm}>
                确认大纲，开始写作
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
