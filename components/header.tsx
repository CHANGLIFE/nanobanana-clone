"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark")
    setIsDark(!isDark)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍌</span>
          <span className="text-xl font-bold text-primary">Nano Banana</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#editor" className="text-sm font-medium hover:text-primary transition-colors">
            Image Editor
          </a>
          <a href="#showcase" className="text-sm font-medium hover:text-primary transition-colors">
            Showcase
          </a>
          <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Testimonials
          </a>
          <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Launch Now</Button>
        </div>
      </div>
    </header>
  )
}
