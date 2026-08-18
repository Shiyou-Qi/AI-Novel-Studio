import React from 'react'
import { FileText } from 'lucide-react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="space-y-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">服务条款</h1>
          <p className="text-muted-foreground">最后更新日期：2026年1月30日</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. 服务说明</h2>
            <p>AI Novel Studio 是一个提供人工智能辅助小说创作工具的平台。通过使用本服务，您同意遵守这些条款。我们保留随时修改或中断服务的权利，且无需事先通知。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. 账户责任</h2>
            <p>您需要对您的账户安全负责。您同意不向他人泄露您的登录凭据，并对通过您的账户进行的任何活动承担全部法律责任。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. 内容所有权</h2>
            <p>如隐私政策所述，您在平台上创作的所有内容的版权归您所有。但是，通过使用 AI 辅助功能，您需要确保您的创作不违反相关法律法规，且不侵犯 any 第三方的知识产权。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. 禁止行为</h2>
            <p>您不得利用本服务生成、传播任何非法、淫秽、暴力或具有欺骗性的内容。我们有权在发现违规行为时，立即停止您的账户服务并删除相关内容。</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. 免责声明</h2>
            <p>本服务按“原样”提供。虽然我们努力确保 AI 生成内容的质量和准确性，但我们不对 AI 生成的内容做任何明示或暗示的保证。您应自行承担使用 AI 生成内容的风险。</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
