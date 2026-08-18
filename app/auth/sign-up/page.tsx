"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Loader2, Mail, Lock, User, Sparkles, ArrowRight, PenTool, Layers, Wand2, Cloud, Download, Eye, EyeOff, UserPlus } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/auth/sign-up-success")
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 w-full relative bg-zinc-950 overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-20" />
      
      {/* Floating Decorative Icons */}
      <div className="absolute top-10 left-10 text-emerald-500/40 animate-float hidden lg:block">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>
      
      <div className="absolute top-1/4 right-1/2 text-orange-500/40 animate-float-delayed hidden lg:block z-0">
        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 backdrop-blur-sm">
          <PenTool className="w-8 h-8" />
        </div>
      </div>

      <div className="absolute bottom-20 left-1/4 text-emerald-500/40 animate-float hidden lg:block">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
          <Cloud className="w-8 h-8" />
        </div>
      </div>

      <Button
        variant="ghost"
        asChild
        className="absolute top-4 right-4 md:top-8 md:right-8 z-20 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-zinc-400"
      >
        <Link href="/" className="flex items-center gap-2 font-medium">
          返回首页
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>

      {/* Left Side - Visual Area */}
      <div className="hidden lg:flex flex-col justify-center items-end p-16 text-white relative z-10">
        <div className="space-y-12 max-w-xl pr-0">
          {/* Logo */}
          <div className="flex items-center gap-3 font-bold text-2xl group cursor-default">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="tracking-tight">AI Novel Studio</span>
          </div>

          {/* Title Area */}
          <div className="space-y-6">
            <h1 className="text-6xl font-bold leading-[1.1] tracking-tight">
              开启您的<br />
              <span className="text-emerald-500">创作之旅</span>
            </h1>
            <p className="text-zinc-400 text-xl leading-relaxed font-light">
              加入数千名创作者的行列，利用先进的人工智能技术，突破想象力的边界，创作出令人惊叹的故事。
            </p>
          </div>

          {/* Features List */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
                <Wand2 className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-zinc-400 text-sm font-medium whitespace-nowrap">无限创意</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
                <Layers className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-zinc-400 text-sm font-medium whitespace-nowrap">结构管理</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
                <Download className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-zinc-400 text-sm font-medium whitespace-nowrap">一键导出</span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Side - Form Area */}
      <div className="flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-zinc-900/40 p-10 rounded-[2rem] border border-zinc-800/50 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
          {/* Subtle light effect in card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />
          
          <div className="space-y-3 text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white">创建账户</h2>
            <p className="text-zinc-500 text-sm">
              填写以下信息以注册新账户
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-zinc-400 text-sm font-medium ml-1">昵称</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="您的笔名"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="pl-12 h-14 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-zinc-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400 text-sm font-medium ml-1">邮箱地址</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-zinc-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-400 text-sm font-medium ml-1">密码</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="至少 6 位字符"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-12 pr-12 h-14 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-zinc-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-base font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 group disabled:opacity-70" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  注册中...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  立即注册
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-zinc-500 text-sm relative z-10">
            已有账户？{" "}
            <Link 
              href="/auth/login" 
              className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright Information */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 text-sm font-light z-20 w-full text-center">
        © {new Date().getFullYear()} AI Novel Studio. 保留所有权利。
      </div>
    </div>
  )
}
