'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, BookOpen, Feather, Wand2 } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      
      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      
      {/* Grid pattern with fade */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      
      {/* Floating elements */}
      <div className={`absolute top-32 left-[15%] transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 animate-[float_6s_ease-in-out_infinite] flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        </div>
      </div>
      <div className={`absolute top-48 right-[12%] transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 animate-[float_5s_ease-in-out_infinite_0.5s]">
          <Feather className="w-6 h-6 text-accent" />
        </div>
      </div>
      <div className={`absolute bottom-40 left-[20%] transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 animate-[float_7s_ease-in-out_infinite_1s]">
          <Wand2 className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-primary font-medium">AI驱动的创作革命</span>
        </div>
        
        <h1 className={`text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight text-balance transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          用AI释放你的
          <br />
          <span className="text-primary relative">
            创作潜能
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 10C50 4 100 2 150 6C200 10 250 8 298 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40 animate-[draw_2s_ease-in-out_forwards]" style={{ strokeDasharray: 300, strokeDashoffset: mounted ? 0 : 300 }} />
            </svg>
          </span>
        </h1>
        
        <p className={`text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed text-pretty transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          从灵感构思到完整小说，AI Novel Studio 帮助你构建故事架构、
          生成章节大纲、智能写作每一个章节
        </p>
        
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button asChild size="lg" className="px-8 py-6 text-lg group relative overflow-hidden">
            <Link href="/dashboard">
              <span className="relative z-10 flex items-center">
                立即开始创作
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent hover:bg-secondary/50 transition-all">
            <Link href="#features">
              了解更多
            </Link>
          </Button>
        </div>
        
        {/* Stats with animation */}
        <div className={`grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-border/50 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="group">
            <p className="text-4xl font-bold text-foreground transition-transform group-hover:scale-110">10+</p>
            <p className="text-muted-foreground mt-1">小说类型支持</p>
          </div>
          <div className="group">
            <p className="text-4xl font-bold text-foreground transition-transform group-hover:scale-110">999</p>
            <p className="text-muted-foreground mt-1">最大章节数</p>
          </div>
          <div className="group">
            <p className="text-4xl font-bold text-foreground transition-transform group-hover:scale-110">10K</p>
            <p className="text-muted-foreground mt-1">每章最大字数</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  )
}
