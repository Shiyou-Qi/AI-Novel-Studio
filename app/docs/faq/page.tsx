import React from 'react'
import { BookOpen, HelpCircle, ChevronDown, MessageSquare, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function FAQPage() {
  const faqs = [
    {
      question: "AI Novel Studio 是完全免费的吗？",
      answer: "我们提供基础功能的永久免费使用权。对于高级 AI 功能（如长篇续写、多角色管理等），我们提供合理的订阅计划。新用户注册即可获得免费的 AI 试用额度。"
    },
    {
      question: "我创作的小说版权归谁所有？",
      answer: "完全归您所有。无论您是否使用了 AI 辅助功能，您在 AI Novel Studio 上创作的所有内容，其知识产权完全属于创作者本人。我们不会对您的作品主张任何权利。"
    },
    {
      question: "支持哪些导出格式？",
      answer: "目前我们支持导出为 PDF、Word (docx)、TXT 以及 EPUB 电子书格式。我们还在不断增加更多针对特定文学网站优化的导出模板。"
    },
    {
      question: "AI 会如何辅助我写作？",
      answer: "AI 可以帮助您：1. 生成灵感和创意大纲；2. 续写卡文段落；3. 润色和扩写简短的描述；4. 分析角色性格和剧情逻辑。您可以将 AI 视为一个不知疲倦的写作助手，而非替代者。"
    },
    {
      question: "如果不满意 AI 生成的内容怎么办？",
      answer: "您可以随时让 AI 重新生成，或者修改您的提示词（Prompt）以获得更精准的结果。我们还提供“撤销”功能，让您可以轻松回退到之前的版本。"
    },
    {
      question: "如何联系客服支持？",
      answer: "如果您在使用过程中遇到任何问题，可以通过页面底部的“联系我们”发送邮件，或者加入我们的官方 Discord 社区进行反馈。"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">常见问题解答</h1>
          <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto">
            关于 AI 创作、账号管理以及平台功能的疑问，这里都有解答。
          </p>
        </div>


        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-sm">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-zinc-800 px-4 rounded-xl data-[state=open]:bg-zinc-800/50 transition-colors">
                <AccordionTrigger className="text-left text-foreground/90 hover:text-foreground hover:no-underline py-6 text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-20 grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:border-emerald-500/30 transition-colors group">
            <MessageSquare className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-foreground mb-2">加入社区</h3>
            <p className="text-muted-foreground mb-6">与其他创作者交流心得，分享您的作品。</p>
            <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">加入 Discord</Button>
          </div>
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:border-emerald-500/30 transition-colors group">
            <Mail className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-foreground mb-2">联系支持</h3>
            <p className="text-muted-foreground mb-6">没有找到您需要的答案？请直接联系我们。</p>
            <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">发送邮件</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
