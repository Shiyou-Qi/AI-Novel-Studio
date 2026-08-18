'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  PenTool,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  LogOut,
  BookText,
  Sparkles,
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
  wordsByProject: { title: string; words: number }[]
}

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  draft: { label: '草稿', dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground' },
  structuring: { label: '构建架构', dot: 'bg-chart-3', badge: 'bg-chart-3/10 text-chart-3' },
  outlining: { label: '规划大纲', dot: 'bg-chart-2', badge: 'bg-chart-2/10 text-chart-2' },
  writing: { label: '写作中', dot: 'bg-primary', badge: 'bg-primary/10 text-primary' },
  completed: { label: '已完成', dot: 'bg-chart-1', badge: 'bg-chart-1/10 text-chart-1' },
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

function formatNumber(num: number) {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}千`
  return num.toString()
}

function initialOf(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || '?'
}

export function DashboardClient({ user, profile, projects, stats, wordsByProject }: DashboardClientProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const displayName = profile?.display_name || user.email?.split('@')[0] || '创作者'

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

  const overallProgress = stats.totalChapters > 0
    ? Math.round((stats.completedChapters / stats.totalChapters) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">AI Novel Studio</span>
            </Link>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <span className="text-sm text-muted-foreground hidden sm:block">仪表盘</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3 h-10">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-medium">
                    {initialOf(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            欢迎回来，{displayName}
          </h1>
          <p className="text-sm text-muted-foreground">管理你的小说项目，继续创作之旅</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={BookText} label="总项目数" value={stats.totalProjects} />
          <StatCard icon={Clock} label="进行中" value={stats.inProgressProjects} />
          <StatCard icon={CheckCircle2} label="已完成章节" value={stats.completedChapters} sublabel={`共 ${stats.totalChapters} 章`} />
          <StatCard icon={Sparkles} label="总字数" value={formatNumber(stats.totalWords)} />
        </div>

        {/* Overview row: progress + chart */}
        <div className="grid lg:grid-cols-3 gap-4 mb-10">
          <Card className="bg-card/50 border-border/50 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">整体完成进度</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-[calc(100%-3rem)] gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-foreground">{overallProgress}%</span>
                <span className="text-xs text-muted-foreground">
                  {stats.completedChapters} / {stats.totalChapters || 0} 章
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">各项目字数分布</CardTitle>
            </CardHeader>
            <CardContent>
              {wordsByProject.length > 0 ? (
                <div className="space-y-3 py-1">
                  {wordsByProject.map((p) => {
                    const max = wordsByProject[0].words
                    const widthPct = max > 0 ? Math.max((p.words / max) * 100, 3) : 0
                    return (
                      <div key={p.title} className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-3 text-xs">
                        <span className="truncate text-muted-foreground" title={p.title}>{p.title}</span>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <span className="text-right font-medium tabular-nums">{formatNumber(p.words)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
                  还没有写作数据，开始创作后这里会显示各项目的字数分布
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">我的项目</h2>
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
              const chapterCount = project.novel_chapters?.[0]?.count || 0
              const progress = project.target_chapters > 0
                ? Math.round((chapterCount / project.target_chapters) * 100)
                : 0
              const updatedDate = new Date(project.updated_at)

              return (
                <Card
                  key={project.id}
                  className="relative overflow-hidden bg-card/50 border-border/50 hover:bg-card/80 hover:border-border transition-all duration-300 group py-0"
                >
                  <span className={`absolute left-0 top-0 h-full w-1 ${status.dot}`} aria-hidden="true" />
                  <CardHeader className="pb-3 pt-5 pl-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">{project.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-2">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {genreLabels[project.genre] || project.genre}
                          </Badge>
                          <Badge className={`text-xs font-normal ${status.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`} />
                            {status.label}
                          </Badge>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            className="text-destructive focus:text-destructive"
                            disabled={deletingId === project.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deletingId === project.id ? '删除中...' : '删除项目'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-5 pb-5">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">章节进度</span>
                        <span className="font-medium tabular-nums">{chapterCount} / {project.target_chapters}</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                        <span>每章约 {project.words_per_chapter} 字</span>
                        <span title={format(updatedDate, 'yyyy-MM-dd HH:mm')}>
                          {formatDistanceToNow(updatedDate, { locale: zhCN, addSuffix: true })}
                        </span>
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

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sublabel?: string
}) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className="w-4 h-4 text-muted-foreground/70" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
