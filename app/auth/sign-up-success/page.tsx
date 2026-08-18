import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, BookOpen } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border-border/50 text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">查收邮件</CardTitle>
            <CardDescription className="mt-2">
              我们已向您的邮箱发送了验证链接
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            请点击邮件中的链接完成账户验证，验证后即可开始您的AI小说创作之旅。
          </p>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              没有收到邮件？请检查垃圾邮件文件夹，或稍后重试。
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/auth/login">
              <div className="w-4 h-4 mr-2 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              返回登录
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">返回首页</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
