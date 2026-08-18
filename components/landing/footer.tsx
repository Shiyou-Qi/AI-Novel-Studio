'use client'

import { BookOpen, Github, Twitter, Mail, Heart, Zap } from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  product: [
    { label: '功能特点', href: '#features' },
    { label: '创作流程', href: '#workflow' },
    { label: '支持类型', href: '#genres' },
    { label: '开始创作', href: '/dashboard' },
  ],
  support: [
    { label: '使用指南', href: '/docs/guide' },
    { label: '常见问题', href: '/docs/faq' },
    { label: '联系我们', href: '/contact' },
  ],
  legal: [
    { label: '隐私政策', href: '/legal/privacy' },
    { label: '服务条款', href: '/legal/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 group mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-bold text-lg text-foreground">AI Novel Studio</span>
                  <p className="text-xs text-muted-foreground">智能小说创作平台</p>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                用AI技术赋能创作，让每一个故事创意都能成为精彩的小说。
                从构思到成稿，一站式智能创作体验。
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors group">
                  <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors group">
                  <Twitter className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
                <a href="mailto:blacklaw@foxmail.com" className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors group">
                  <Mail className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                产品
              </h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">支持</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">保持联系</h4>
              <p className="text-sm text-muted-foreground mb-4">
                订阅我们的更新，获取最新功能和创作技巧。
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="输入邮箱"
                  className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  订阅
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> by AI Novel Studio Team
              </p>
              <div className="flex items-center gap-6">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} AI Novel Studio. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
