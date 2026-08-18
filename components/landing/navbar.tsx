'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, LogIn, Menu, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/#features', label: '功能特点' },
  { href: '/#workflow', label: '创作流程' },
  { href: '/#genres', label: '支持类型' },
  { href: '/docs/guide', label: '使用指南' },
  { href: '/docs/faq', label: '常见问题' },
  { href: '/contact', label: '联系我们' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled 
        ? "bg-background/80 backdrop-blur-2xl border-b border-border/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" 
        : "bg-gradient-to-b from-background/50 to-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/25">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground tracking-tight">AI Novel Studio</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">智能小说创作平台</span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="relative px-4 py-2 text-[15px] font-semibold text-muted-foreground/90 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-secondary/50 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 group-hover:w-1/2" />
              </Link>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
              <Link href="/auth/login">
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </Link>
            </Button>
            <Button asChild className="h-11 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 font-bold">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                开始创作
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 transition-all duration-300 overflow-hidden",
        mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-[15px] font-semibold text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2 border-t border-border/50">
            <Button asChild variant="outline" className="w-full justify-center bg-transparent">
              <Link href="/auth/login">
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </Link>
            </Button>
            <Button asChild className="w-full justify-center bg-gradient-to-r from-primary to-primary/80">
              <Link href="/dashboard">
                <Sparkles className="w-4 h-4 mr-2" />
                开始创作
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
