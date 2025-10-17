import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Globe } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Decorative bananas */}
      <div
        className="absolute left-10 top-20 text-6xl opacity-20 animate-bounce"
        style={{ animationDelay: "0s", animationDuration: "3s" }}
      >
        🍌
      </div>
      <div
        className="absolute right-10 top-32 text-6xl opacity-20 animate-bounce"
        style={{ animationDelay: "1s", animationDuration: "3s" }}
      >
        🍌
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>The AI model that outperforms Flux Kontext</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance md:text-7xl">
            <span className="text-primary">Nano Banana</span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground text-balance md:text-xl leading-relaxed">
            Transform any image with simple text prompts. Nano-banana's advanced model delivers consistent character
            editing and scene preservation that surpasses Flux Kontext. Experience the future of AI image editing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Start Editing
            </Button>
            <Button size="lg" variant="outline">
              View Examples
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>One-shot editing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Multi-image support</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>Natural language</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
