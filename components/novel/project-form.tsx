'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { BookOpen, Sparkles, Wand2 } from 'lucide-react'
import { useNovelStore } from '@/lib/store'
import { GENRE_OPTIONS, type NovelGenre, type ProjectFormData } from '@/lib/types'

export function ProjectForm() {
  const { createProject, setCurrentStep } = useNovelStore()
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    theme: '',
    genre: '玄幻',
    targetChapters: 10,
    wordsPerChapter: 2000,
    guidance: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.theme) return
    createProject(formData)
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            创建新小说项目
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            设定您的小说基本信息，AI将帮助您构建完整的故事架构
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                基本设置
              </CardTitle>
              <CardDescription>
                定义您小说的核心信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">小说标题</Label>
                <Input
                  id="title"
                  placeholder="输入小说标题..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-input/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">主题/核心创意</Label>
                <Textarea
                  id="theme"
                  placeholder="描述您小说的核心创意、主要情节或想要表达的主题..."
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="min-h-[120px] bg-input/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">小说类型</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value: NovelGenre) => setFormData({ ...formData, genre: value })}
                >
                  <SelectTrigger className="bg-input/50">
                    <SelectValue placeholder="选择小说类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-accent" />
                篇幅设置
              </CardTitle>
              <CardDescription>
                规划您小说的章节数量和字数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>预计章节数量</Label>
                  <span className="text-2xl font-bold text-primary">{formData.targetChapters}</span>
                </div>
                <Slider
                  value={[formData.targetChapters]}
                  onValueChange={([value]) => setFormData({ ...formData, targetChapters: value })}
                  min={3}
                  max={999}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>短篇 (3章)</span>
                  <span>中篇 (50章)</span>
                  <span>长篇 (999章)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>每章字数</Label>
                  <span className="text-2xl font-bold text-accent">{formData.wordsPerChapter.toLocaleString()}</span>
                </div>
                <Slider
                  value={[formData.wordsPerChapter]}
                  onValueChange={([value]) => setFormData({ ...formData, wordsPerChapter: value })}
                  min={500}
                  max={10000}
                  step={100}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>500字</span>
                  <span>5000字</span>
                  <span>10000字</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  预计总字数: <span className="font-semibold text-foreground">{(formData.targetChapters * formData.wordsPerChapter).toLocaleString()}</span> 字
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>创作指导 (可选)</CardTitle>
              <CardDescription>
                添加额外的写作风格、人物设定或特殊要求
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="例如：希望文风偏向轻松幽默，主角性格要坚韧不拔，故事节奏要紧凑..."
                value={formData.guidance}
                onChange={(e) => setFormData({ ...formData, guidance: e.target.value })}
                className="min-h-[100px] bg-input/50"
              />
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              className="px-12 py-6 text-lg"
              disabled={!formData.title || !formData.theme}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              开始创作
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
