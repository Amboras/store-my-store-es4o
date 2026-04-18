'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-foreground text-primary-foreground">
      <div className="container-custom flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm tracking-wide">
        <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
        <p>
          <span className="font-semibold">Launch Sale — 50% Off</span>
          <span className="hidden sm:inline"> · Instant download · Read on any device</span>
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
