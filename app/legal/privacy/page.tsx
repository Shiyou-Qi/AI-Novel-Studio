import React from 'react'
import { BookOpen, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="space-y-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">隐私政策</h1>
          <p className="text-muted-foreground">最后更新日期：2026年1月30日</p>
        </div>


        <div className="prose prose-invert max-w-none space-y-8 text-zinc-400 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. 信息收集</h2>
            <p>我们仅收集为您提供服务所必需的信息，包括您的电子邮箱地址、账户设置以及您在使用平台过程中主动创建的内容。我们不会在未经您允许的情况下收集任何敏感个人信息。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. 信息使用</h2>
            <p>您的信息将主要用于：提供并改进 AI 写作服务、处理您的订阅请求、发送重要的账户通知以及进行必要的安全性验证。我们承诺不会将您的个人信息出售给任何第三方。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. 数据安全</h2>
            <p>我们采用行业标准的加密技术来保护您的数据传输和存储安全。您的作品和个人信息都被存储在经过严格安全审计的云端服务器中。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. 您的权利</h2>
            <p>您有权随时查看、修改或删除您的个人信息。如果您决定注销账户，我们将根据相关法律法规的要求，在合理期限内删除您的所有个人数据。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Cookie 使用</h2>
            <p>我们使用 Cookie 来保持您的登录状态并优化用户体验。您可以根据自己的偏好在浏览器设置中管理或禁用 Cookie。</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
