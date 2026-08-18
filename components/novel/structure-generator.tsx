'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles, Users, Globe, BookText, ArrowRight, RefreshCw, Edit3 } from 'lucide-react'
import { useNovelStore } from '@/lib/store'
import type { NovelStructure, Character } from '@/lib/types'

export function StructureGenerator() {
  const { currentProject, updateStructure, setCurrentStep, isGenerating, setIsGenerating } = useNovelStore()
  const [structure, setStructure] = useState<NovelStructure | null>(currentProject?.structure || null)
  const [error, setError] = useState<string | null>(null)

  const generateStructure = useCallback(async () => {
    if (!currentProject) return
    
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentProject.title,
          theme: currentProject.theme,
          genre: currentProject.genre,
          guidance: currentProject.guidance,
        }),
      })

      if (!response.ok) {
        throw new Error('生成架构失败')
      }

      const data = await response.json()
      setStructure(data.structure)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [currentProject, setIsGenerating])

  const handleConfirm = () => {
    if (structure) {
      updateStructure(structure)
      setCurrentStep('outline')
    }
  }

  const updateField = (field: keyof NovelStructure, value: string | string[] | Character[]) => {
    if (!structure) return
    setStructure({ ...structure, [field]: value })
  }

  if (!currentProject) return null

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>项目</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-foreground">{currentProject.title}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">小说架构</h1>
          <p className="text-muted-foreground">
            AI将基于您的设定生成完整的故事架构，包括世界观、角色设定和情节大纲
          </p>
        </div>

        {!structure && !isGenerating && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">准备生成小说架构</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                AI将根据「{currentProject.theme.slice(0, 50)}...」生成完整的故事框架
              </p>
              <Button size="lg" onClick={generateStructure}>
                <Sparkles className="w-4 h-4 mr-2" />
                生成架构
              </Button>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="py-16 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-semibold mb-2">正在生成小说架构...</h2>
              <p className="text-muted-foreground">AI正在为您构建完整的故事世界</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={generateStructure}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
            </CardContent>
          </Card>
        )}

        {structure && !isGenerating && (
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  世界观设定
                </CardTitle>
                <CardDescription>故事发生的世界背景和规则</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={structure.worldSetting}
                  onChange={(e) => updateField('worldSetting', e.target.value)}
                  className="min-h-[150px] bg-input/50"
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  主要角色
                </CardTitle>
                <CardDescription>故事的核心人物设定</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {structure.mainCharacters.map((char, index) => (
                    <div key={index} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{char.name}</h4>
                        <Badge variant="outline">{char.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{char.description}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-foreground/70">动机:</span> {char.motivation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookText className="w-5 h-5 text-primary" />
                  故事梗概
                </CardTitle>
                <CardDescription>整体情节发展概要</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={structure.plotSummary}
                  onChange={(e) => updateField('plotSummary', e.target.value)}
                  className="min-h-[150px] bg-input/50"
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-accent" />
                  核心主题
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {structure.themes.map((theme, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={generateStructure}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
              <Button size="lg" onClick={handleConfirm}>
                确认架构，生成大纲
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
