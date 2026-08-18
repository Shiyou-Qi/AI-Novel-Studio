import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">认证错误</CardTitle>
            <CardDescription className="mt-2">
              登录过程中出现问题
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground">
            可能是链接已过期或无效，请重新尝试登录或注册。
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登录
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
