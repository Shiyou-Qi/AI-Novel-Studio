'use client'

import { GENRE_OPTIONS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export function GenresSection() {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            支持10+小说类型
          </h2>
          <p className="text-lg text-muted-foreground">
            无论你想写什么类型的故事，AI都能给你专业的创作支持
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {GENRE_OPTIONS.map((genre) => (
            <div 
              key={genre.value}
              className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all cursor-default"
            >
              <div className="text-center">
                <Badge variant="secondary" className="mb-3 text-sm">
                  {genre.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {genre.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
