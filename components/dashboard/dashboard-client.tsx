'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Plus,
  FileText,
  PenTool,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  LogOut,
  BarChart3,
  BookMarked,
  Layers,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

interface Project {
  id: string
  title: string
  genre: string
  status: string
  target_chapters: number
  words_per_chapter: number
  created_at: string
  updated_at: string
  novel_chapters: { count: number }[]
}

interface Stats {
  totalProjects: number
  completedProjects: number
  inProgressProjects: number
  totalChapters: number
  completedChapters: number
  totalWords: number
}

interface DashboardClientProps {
  user: SupabaseUser
  profile: Profile | null
  projects: Project[]
  stats: Stats
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: '草稿', color: 'bg-muted text-muted-foreground', icon: FileText },
  structuring: { label: '构建架构', color: 'bg-blue-500/10 text-blue-500', icon: Layers },
  outlining: { label: '规划大纲', color: 'bg-amber-500/10 text-amber-500', icon: BookMarked },
  writing: { label: '写作中', color: 'bg-primary/10 text-primary', icon: PenTool },
  completed: { label: '已完成', color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 },
}

const genreLabels: Record<string, string> = {
  fantasy: '玄幻',
  wuxia: '武侠',
  scifi: '科幻',
  romance: '言情',
  urban: '都市',
  history: '历史',
  mystery: '悬疑',
  horror: '恐怖',
  game: '游戏',
  other: '其他',
}

export function DashboardClient({ user, profile, projects, stats }: DashboardClientProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) return
    
    setDeletingId(projectId)
    
    await supabase.from('novel_chapters').delete().eq('project_id', projectId)
    await supabase.from('novel_characters').delete().eq('project_id', projectId)
    await supabase.from('novel_structures').delete().eq('project_id', projectId)
    await supabase.from('novel_projects').delete().eq('id', projectId)
    
    setDeletingId(null)
    router.refresh()
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}千`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-foreground">AI Novel Studio</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline">{profile?.display_name || user.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled>
                <BookOpen className="w-4 h-4 mr-2" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            欢迎回来，{profile?.display_name || '创作者'}
          </h1>
          <p className="text-muted-foreground">管理你的小说项目，继续创作之旅</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
                  <p className="text-xs text-muted-foreground">总项目数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgressProjects}</p>
                  <p className="text-xs text-muted-foreground">进行中</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completedChapters}</p>
                  <p className="text-xs text-muted-foreground">已完成章节</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalWords)}</p>
                  <p className="text-xs text-muted-foreground">总字数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">我的项目</h2>
          <Button asChild>
            <Link href="/create">
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-card/50 border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">开始你的第一部小说</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                创建一个新项目，让AI帮助你构建故事架构、生成大纲并写作章节
              </p>
              <Button asChild>
                <Link href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  新建项目
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const status = statusConfig[project.status] || statusConfig.draft
              const StatusIcon = status.icon
              const chapterCount = project.novel_chapters?.[0]?.count || 0
              const progress = project.target_chapters > 0 
                ? Math.round((chapterCount / project.target_chapters) * 100) 
                : 0

              return (
                <Card 
                  key={project.id} 
                  className="bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {genreLabels[project.genre] || project.genre}
                          </Badge>
                          <Badge className={`text-xs ${status.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/project/${project.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              查看详情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/project/${project.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              继续编辑
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(project.id)}
                            className="text-destructive"
                            disabled={deletingId === project.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deletingId === project.id ? '删除中...' : '删除项目'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">章节进度</span>
                        <span className="font-medium">{chapterCount} / {project.target_chapters}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>每章约 {project.words_per_chapter} 字</span>
                        <span>{format(new Date(project.updated_at), 'yyyy-MM-dd')}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full mt-4" variant="secondary">
                      <Link href={`/project/${project.id}/edit`}>
                        <PenTool className="w-4 h-4 mr-2" />
                        继续创作
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
