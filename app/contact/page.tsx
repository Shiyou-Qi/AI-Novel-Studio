'use client'

import React, { useState } from 'react'
import { BookOpen, Mail, MessageSquare, MapPin, Send, Github, Twitter, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { SliderCaptcha } from '@/components/ui/slider-captcha'

import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaPassed, setCaptchaPassed] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaPassed) {
      setError('请先完成滑块验证')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert([formData])

      if (submitError) throw submitError

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setCaptchaPassed(false)
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Left Side - Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">联系我们</h1>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                有任何建议、问题或合作意向？我们非常期待听到您的声音。请通过表单或以下联系方式与我们取得联系。
              </p>
            </div>


            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">官方邮箱</h3>
                  <p className="text-muted-foreground">blacklaw@foxmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">在线社区</h3>
                  <p className="text-muted-foreground">加入我们的 Discord 创作者社区进行实时反馈。</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">公司地址</h3>
                  <p className="text-muted-foreground">北京市朝阳区科技园区 A 座 808 室</p>
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-zinc-700 transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-zinc-700 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-10 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />
            
            {submitted ? (
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">消息已发送！</h2>
                  <p className="text-zinc-400">感谢您的反馈，我们会尽快回复您。</p>
                </div>
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline" 
                  className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  再次发送
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {error && (
                  <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-muted-foreground ml-1">您的姓名</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="张先生/女士" 
                      className="h-14 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground ml-1">电子邮箱</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@example.com" 
                      className="h-14 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-muted-foreground ml-1">咨询主题</Label>
                  <Input 
                    id="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="如何与我们合作" 
                    className="h-14 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-muted-foreground ml-1">详细信息</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="请描述您的问题或需求..." 
                    className="min-h-[160px] bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 rounded-xl resize-none py-4"
                  />
                </div>

                <div className="pt-2">
                  <SliderCaptcha onVerify={setCaptchaPassed} />
                </div>

                <Button 
                  type="submit"
                  disabled={loading || !captchaPassed}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      发送消息
                      <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
