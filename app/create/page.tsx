'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  LogIn,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const genres = [
  { value: 'fantasy', label: '玄幻' },
  { value: 'wuxia', label: '武侠' },
  { value: 'scifi', label: '科幻' },
  { value: 'romance', label: '言情' },
  { value: 'urban', label: '都市' },
  { value: 'history', label: '历史' },
  { value: 'mystery', label: '悬疑' },
  { value: 'horror', label: '恐怖' },
  { value: 'game', label: '游戏' },
  { value: 'other', label: '其他' },
]

export default function CreatePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    concept: '',
    genre: 'fantasy',
    targetChapters: 10,
    wordsPerChapter: 2000,
    guidance: '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!formData.title.trim() || !formData.concept.trim()) {
      return
    }

    setCreating(true)

    try {
      const { data: project, error } = await supabase
        .from('novel_projects')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          core_idea: formData.concept.trim(),
          genre: formData.genre,
          target_chapters: formData.targetChapters,
          words_per_chapter: formData.wordsPerChapter,
          writing_guidance: formData.guidance.trim() || null,
          status: 'draft',
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', JSON.stringify(error, null, 2))
        throw error
      }

      router.push(`/project/${project.id}/edit`)
    } catch (error) {
      console.error('Error creating project:', error)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-foreground text-sm">AI Novel Studio</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回仪表盘
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  登录
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-14 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <Card className="relative z-10 bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">创建新小说</CardTitle>
              <CardDescription>
                填写基本信息，AI将帮助你构建完整的故事
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">小说标题 *</Label>
                  <Input
                    id="title"
                    placeholder="给你的小说起个名字"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>

                {/* Concept */}
                <div className="space-y-2">
                  <Label htmlFor="concept">核心创意 *</Label>
                  <Textarea
                    id="concept"
                    placeholder="描述你的故事创意、主要情节或想要表达的主题..."
                    value={formData.concept}
                    onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                    required
                    rows={4}
                    className="bg-background/50 resize-none"
                  />
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <Label>小说类型</Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(value) => setFormData({ ...formData, genre: value })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre.value} value={genre.value}>
                          {genre.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Chapters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>预计章节数量</Label>
                    <span className="text-sm font-medium text-primary">{formData.targetChapters} 章</span>
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

                {/* Words Per Chapter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>每章字数</Label>
                    <span className="text-sm font-medium text-primary">{formData.wordsPerChapter} 字</span>
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

                {/* Guidance */}
                <div className="space-y-2">
                  <Label htmlFor="guidance">创作指导（可选）</Label>
                  <Textarea
                    id="guidance"
                    placeholder="写作风格偏好、特别要求、参考作品等..."
                    value={formData.guidance}
                    onChange={(e) => setFormData({ ...formData, guidance: e.target.value })}
                    rows={3}
                    className="bg-background/50 resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    预计总字数约{' '}
                    <span className="font-medium text-foreground">
                      {(formData.targetChapters * formData.wordsPerChapter).toLocaleString()}
                    </span>{' '}
                    字
                  </p>
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={creating || !formData.title.trim() || !formData.concept.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : user ? (
                    <>
                      开始创作
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      登录后创建
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    需要登录才能保存你的创作进度
                  </p>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
