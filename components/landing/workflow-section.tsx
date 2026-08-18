'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const steps = [
  {
    number: '01',
    title: '创建项目',
    description: '设定小说标题、类型、核心创意和篇幅规划',
    highlight: true,
  },
  {
    number: '02',
    title: '生成架构',
    description: 'AI分析你的创意，构建完整的故事世界观和角色体系',
    highlight: false,
  },
  {
    number: '03',
    title: '规划大纲',
    description: '基于架构自动生成所有章节的详细情节大纲',
    highlight: false,
  },
  {
    number: '04',
    title: '智能写作',
    description: 'AI根据大纲逐章创作，支持实时编辑和调整',
    highlight: false,
  },
  {
    number: '05',
    title: '导出作品',
    description: '选择喜欢的格式，导出完整小说作品',
    highlight: false,
  },
]

export function WorkflowSection() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const [lineHeight, setLineHeight] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-step'))
            setVisibleSteps((prev) => [...new Set([...prev, index])])
            setLineHeight(((index + 1) / steps.length) * 100)
          }
        })
      },
      { threshold: 0.3 }
    )

    const stepElements = sectionRef.current?.querySelectorAll('[data-step]')
    stepElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto" ref={sectionRef}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            简单五步，完成你的小说
          </h2>
          <p className="text-lg text-muted-foreground">
            清晰的创作流程，让复杂的写作变得简单
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line background */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
          {/* Animated progress line */}
          <div 
            className="absolute left-8 md:left-1/2 top-0 w-px bg-primary md:-translate-x-1/2 transition-all duration-700 ease-out"
            style={{ height: `${lineHeight}%` }}
          />
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                data-step={index}
                className={cn(
                  "relative flex items-start gap-8 transition-all duration-500",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
                  visibleSteps.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Number circle */}
                <div className={cn(
                  "relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-background border-2 flex items-center justify-center transition-all duration-500",
                  visibleSteps.includes(index) ? "border-primary scale-100" : "border-border scale-90"
                )}>
                  <span className={cn(
                    "text-xl font-bold transition-colors duration-500",
                    visibleSteps.includes(index) ? "text-primary" : "text-muted-foreground"
                  )}>{step.number}</span>
                  {visibleSteps.includes(index) && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  )}
                </div>
                
                {/* Content */}
                <div 
                  className={cn(
                    "flex-1 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]",
                    step.highlight 
                      ? "bg-primary/10 border border-primary/30 hover:bg-primary/15" 
                      : "bg-secondary/50 border border-border/50 hover:bg-secondary/70"
                  )}
                >
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
