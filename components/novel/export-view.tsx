'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, FileText, BookOpen, ArrowLeft, Check, 
  Copy, FileJson, File, Printer
} from 'lucide-react'
import { useNovelStore } from '@/lib/store'
import { downloadFile } from '@/lib/utils'

export function ExportView() {
  const { currentProject, setCurrentStep } = useNovelStore()
  const [copied, setCopied] = useState(false)

  if (!currentProject) return null

  const chapters = currentProject.chapters.filter(ch => ch.content)
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.content?.length || 0), 0)

  const generatePlainText = () => {
    let content = `${currentProject.title}\n\n`
    content += `类型: ${currentProject.genre}\n`
    content += `主题: ${currentProject.theme}\n\n`
    content += '='.repeat(50) + '\n\n'
    
    chapters.forEach(chapter => {
      content += `第${chapter.number}章 ${chapter.title}\n\n`
      content += chapter.content + '\n\n'
      content += '-'.repeat(30) + '\n\n'
    })
    
    return content
  }

  const generateMarkdown = () => {
    let content = `# ${currentProject.title}\n\n`
    content += `> **类型:** ${currentProject.genre}  \n`
    content += `> **主题:** ${currentProject.theme}\n\n`
    content += '---\n\n'
    
    if (currentProject.structure) {
      content += '## 故事概要\n\n'
      content += `### 世界观\n${currentProject.structure.worldSetting}\n\n`
      content += '### 主要角色\n\n'
      currentProject.structure.mainCharacters.forEach(char => {
        content += `- **${char.name}** (${char.role}): ${char.description}\n`
      })
      content += '\n---\n\n'
    }
    
    chapters.forEach(chapter => {
      content += `## 第${chapter.number}章 ${chapter.title}\n\n`
      content += chapter.content + '\n\n'
    })
    
    return content
  }

  const generateJSON = () => {
    return JSON.stringify({
      title: currentProject.title,
      genre: currentProject.genre,
      theme: currentProject.theme,
      structure: currentProject.structure,
      chapters: chapters.map(ch => ({
        number: ch.number,
        title: ch.title,
        outline: ch.outline,
        content: ch.content,
        wordCount: ch.content?.length || 0,
      })),
      metadata: {
        totalChapters: chapters.length,
        totalWords,
        createdAt: currentProject.createdAt,
        exportedAt: new Date().toISOString(),
      }
    }, null, 2)
  }

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setCurrentStep('write')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回写作
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">导出小说</h1>
          <p className="text-muted-foreground">
            选择格式导出您的作品
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{chapters.length}</div>
                <div className="text-sm text-muted-foreground">已完成章节</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">{totalWords.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">总字数</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {Math.round(totalWords / chapters.length).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">平均每章字数</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              导出格式
            </CardTitle>
            <CardDescription>选择适合您需求的导出格式</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="border-border/50 bg-secondary/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => downloadFile(generatePlainText(), `${currentProject.title}.txt`, 'text/plain')}
              >
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">纯文本 (.txt)</h3>
                  <p className="text-xs text-muted-foreground">适合阅读和打印</p>
                </CardContent>
              </Card>

              <Card 
                className="border-border/50 bg-secondary/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => downloadFile(generateMarkdown(), `${currentProject.title}.md`, 'text/markdown')}
              >
                <CardContent className="pt-6 text-center">
                  <File className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Markdown (.md)</h3>
                  <p className="text-xs text-muted-foreground">适合发布和编辑</p>
                </CardContent>
              </Card>

              <Card 
                className="border-border/50 bg-secondary/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => downloadFile(generateJSON(), `${currentProject.title}.json`, 'application/json')}
              >
                <CardContent className="pt-6 text-center">
                  <FileJson className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">JSON (.json)</h3>
                  <p className="text-xs text-muted-foreground">适合备份和导入</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                内容预览
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(generatePlainText())}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    复制全文
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="chapters">章节列表</TabsTrigger>
                <TabsTrigger value="preview">全文预览</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chapters">
                <div className="space-y-3">
                  {chapters.map(chapter => (
                    <div 
                      key={chapter.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {chapter.number}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{chapter.title}</p>
                          <p className="text-xs text-muted-foreground">{chapter.content?.length.toLocaleString()} 字</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Check className="w-3 h-3 mr-1" />
                        已完成
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="preview">
                <ScrollArea className="h-[400px] rounded-lg border border-border/50 bg-secondary/30 p-4">
                  <div className="space-y-6">
                    <div className="text-center pb-6 border-b border-border/50">
                      <h2 className="text-2xl font-bold text-foreground mb-2">{currentProject.title}</h2>
                      <p className="text-muted-foreground">{currentProject.genre} · {totalWords.toLocaleString()} 字</p>
                    </div>
                    {chapters.map(chapter => (
                      <div key={chapter.id} className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          第{chapter.number}章 {chapter.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {chapter.content?.slice(0, 500)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
