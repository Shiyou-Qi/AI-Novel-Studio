'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Layers, 
  PenTool, 
  Download, 
  Lightbulb, 
  Users,
  Target
} from 'lucide-react'

const features = [
  {
    icon: Lightbulb,
    title: '智能构思',
    description: '输入核心创意，AI帮你完善故事世界观、角色设定和情节脉络',
  },
  {
    icon: Layers,
    title: '架构规划',
    description: '自动生成完整的故事架构，包括人物关系、时间线和核心冲突',
  },
  {
    icon: Target,
    title: '大纲生成',
    description: '根据架构智能生成每个章节的详细大纲，确保故事连贯推进',
  },
  {
    icon: PenTool,
    title: '章节写作',
    description: '基于大纲AI智能写作，支持流式输出和实时编辑',
  },
  {
    icon: Users,
    title: '角色塑造',
    description: '深度角色分析，确保人物性格一致性和成长弧线',
  },
  {
    icon: Download,
    title: '多格式导出',
    description: '支持TXT、Markdown、JSON等多种格式，方便后续编辑',
  },
]

export function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setVisibleCards((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-index]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-24 px-4 bg-secondary/30 overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={sectionRef}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            全流程AI创作辅助
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            从灵感到成稿，每一步都有AI智能协助，让创作更轻松、更高效
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              data-index={index}
              className={cn(
                "relative group transition-all duration-700",
                visibleCards.includes(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Glowing Edge Effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-b from-primary/50 via-primary/5 to-transparent rounded-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[0.5px]" />
              
              <Card className="relative h-full border-border/50 bg-card/50 backdrop-blur transition-all duration-500 group-hover:bg-card/80 group-hover:scale-[1.01] group-hover:shadow-2xl group-hover:shadow-primary/5">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <feature.icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
