import React from 'react'
import { BookOpen, PenTool, Sparkles, Layers, Wand2, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
      </div>

      <main className="relative max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            快速上手
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            使用指南
          </h1>
          <p className="text-xl text-zinc-400 font-light leading-relaxed">
            欢迎来到 AI Novel Studio。本指南将帮助您快速掌握平台核心功能，<br className="hidden md:block" />
            开启您的 AI 驱动小说创作之旅。
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-2 relative">
          {/* Decorative Line (Hidden on mobile) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-orange-500/20 to-purple-500/20 -translate-x-1/2" />

          {/* Step 1 */}
          <section className="group relative space-y-6 p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Sparkles className="w-32 h-32 text-emerald-500" />
            </div>
            
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <span className="text-emerald-500/60 text-xs font-bold tracking-widest uppercase">STEP 01</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">构思创意</h2>
              </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <p className="leading-relaxed text-zinc-400 text-lg">
                一切从一个简单的想法开始。您可以输入一个简短的故事简介、特定的主题、或者您想要探索的冲突。AI 将根据您的输入，为您提供初步的故事大纲和角色设定建议。
              </p>
              <div className="grid gap-3">
                {[
                  "输入故事的核心概念与冲突",
                  "选择小说类型（玄幻、都市、言情等）",
                  "设定故事的整体情感基调与氛围"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="group relative space-y-6 p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/5 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Layers className="w-32 h-32 text-orange-500" />
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform duration-500">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <span className="text-orange-500/60 text-xs font-bold tracking-widest uppercase">STEP 02</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">构建大纲</h2>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <p className="leading-relaxed text-zinc-400 text-lg">
                使用我们强大的大纲管理工具。AI 会根据您的创意生成结构化的章节建议。您可以自由调整章节顺序，添加关键情节，或者让 AI 为特定章节生成更详细的子大纲。
              </p>
              <div className="grid gap-3">
                {[
                  "AI 自动生成多级结构化大纲",
                  "灵活拖拽调整章节逻辑与顺序",
                  "为每个章节设定具体的写作目标"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="group relative space-y-6 p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <PenTool className="w-32 h-32 text-blue-500" />
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform duration-500">
                <PenTool className="w-7 h-7" />
              </div>
              <div>
                <span className="text-blue-500/60 text-xs font-bold tracking-widest uppercase">STEP 03</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">智能写作</h2>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <p className="leading-relaxed text-zinc-400 text-lg">
                进入核心写作界面。您可以手动写作，或者利用 AI 辅助功能：续写、扩写、改写，甚至让 AI 帮您描写复杂的动作场景或优美的环境描写。
              </p>
              <div className="grid gap-3">
                {[
                  "AI 一键续写与风格化智能建议",
                  "沉浸式、无干扰的专业写作环境",
                  "实时字数统计与创作进度追踪"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="group relative space-y-6 p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/5 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Download className="w-32 h-32 text-purple-500" />
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0 group-hover:scale-110 transition-transform duration-500">
                <Download className="w-7 h-7" />
              </div>
              <div>
                <span className="text-purple-500/60 text-xs font-bold tracking-widest uppercase">STEP 04</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">导出与发布</h2>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <p className="leading-relaxed text-zinc-400 text-lg">
                完成作品后，您可以一键导出为多种格式。我们支持主流的小说平台格式要求，让您的发布过程更加顺畅，作品触达更多读者。
              </p>
              <div className="grid gap-3">
                {[
                  "支持 Word、PDF、EPUB 等多种格式",
                  "针对小说平台的一键优化导出",
                  "云端自动同步，保障作品永不丢失"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="mt-32 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-orange-500/20 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative p-12 rounded-[3rem] bg-zinc-900/80 border border-white/5 text-center space-y-8 backdrop-blur-md">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Wand2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white">准备好开启创作之旅了吗？</h3>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                现在就加入 AI Novel Studio，体验前所未有的智能创作流程。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-14 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-10 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95">
                <Link href="/auth/login" className="flex items-center gap-2">
                  立即开始创作
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-14 text-zinc-400 hover:text-white hover:bg-white/5 px-10 rounded-2xl">
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
