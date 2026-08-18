'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SliderCaptchaProps {
  onVerify: (success: boolean) => void
  className?: string
}

export function SliderCaptcha({ onVerify, className }: SliderCaptchaProps) {
  const [isPassed, setIsPassed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPassed) return
    setIsDragging(true)
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isPassed || !containerRef.current || !sliderRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const sliderWidth = sliderRef.current.offsetWidth
    const maxPath = containerRect.width - sliderWidth - 8 // 8 is padding

    let clientX = 0
    if ('touches' in e) {
      clientX = e.touches[0].clientX
    } else {
      clientX = e.clientX
    }

    let newPosition = clientX - containerRect.left - sliderWidth / 2
    
    if (newPosition < 0) newPosition = 0
    if (newPosition > maxPath) newPosition = maxPath

    setPosition(newPosition)

    if (newPosition >= maxPath - 5) {
      handleSuccess()
    }
  }

  const handleEnd = () => {
    if (isPassed) return
    setIsDragging(false)
    if (!isPassed) {
      setPosition(0)
    }
  }

  const handleSuccess = () => {
    setIsPassed(true)
    setIsDragging(false)
    onVerify(true)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchmove', handleMove)
      window.addEventListener('touchend', handleEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative h-12 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden select-none",
        className
      )}
    >
      {/* Background text */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center text-sm font-medium transition-opacity duration-300",
        isPassed ? "text-emerald-500 opacity-100" : "text-zinc-500 opacity-100",
        isDragging && "opacity-0"
      )}>
        {isPassed ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            验证通过
          </div>
        ) : (
          "向右滑动验证"
        )}
      </div>

      {/* Track progress */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-300 ease-out",
          isPassed ? "w-full" : ""
        )}
        style={{ width: isPassed ? '100%' : `${position + 44}px` }}
      />

      {/* Slider button */}
      <div
        ref={sliderRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{ transform: `translateX(${position}px)` }}
        className={cn(
          "absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing transition-shadow duration-200 z-10",
          isPassed 
            ? "bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200",
          isDragging && "shadow-lg scale-105"
        )}
      >
        {isPassed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>
    </div>
  )
}
