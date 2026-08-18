'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, BookOpen, Feather, Stars } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="max-w-5xl mx-auto relative">
        <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-card via-card to-secondary/50 border border-border/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          
          {/* Floating icons */}
          <div className={`absolute top-8 left-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-3 bg-primary/10 rounded-xl animate-[float_6s_ease-in-out_infinite] flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
          </div>
          <div className={`absolute top-12 right-12 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-3 bg-accent/10 rounded-xl animate-[float_5s_ease-in-out_infinite_0.5s]">
              <Feather className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className={`absolute bottom-12 right-20 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-3 bg-primary/10 rounded-xl animate-[float_7s_ease-in-out_infinite_1s]">
              <Stars className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="relative text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">免费开始，无需信用卡</span>
            </div>
            
            <h2 className={`text-3xl md:text-5xl font-bold text-foreground mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              准备好释放你的
              <span className="text-primary"> 创作潜能 </span>
              了吗？
            </h2>
            
            <p className={`text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              加入数千位创作者的行列，用AI的力量将你的故事创意变为现实。
              从第一个灵感到完整小说，我们陪你走过每一步。
            </p>
            
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button asChild size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group">
                <Link href="/dashboard">
                  开始免费创作
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-10 py-6 text-lg bg-transparent hover:bg-secondary/50">
                <Link href="#features">
                  了解更多功能
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className={`mt-12 pt-8 border-t border-border/50 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>实时AI生成</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>多种小说类型</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>云端自动保存</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>多格式导出</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  )
}
