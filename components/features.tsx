import { Card } from "@/components/ui/card"
import { ImageIcon, Wand2, Layers } from "lucide-react"

const features = [
  {
    icon: ImageIcon,
    title: "Image to Image",
    description: "Transform your image with AI-powered editing using simple text commands",
  },
  {
    icon: Wand2,
    title: "Text to Image",
    description: "Generate stunning visuals from text descriptions with advanced AI models",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    description: "Process multiple images at once with consistent quality and style",
  },
]

export function Features() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
