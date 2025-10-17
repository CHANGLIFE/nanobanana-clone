import { Card } from "@/components/ui/card"

const showcaseItems = [
  {
    title: "Portrait Enhancement",
    description: "Transform portraits with natural lighting and professional quality",
    image: "/professional-portrait-with-natural-lighting.jpg",
  },
  {
    title: "Scene Transformation",
    description: "Change environments while preserving character consistency",
    image: "/futuristic-cityscape-at-golden-hour.jpg",
  },
  {
    title: "Style Transfer",
    description: "Apply artistic styles while maintaining image structure",
    image: "/artistic-style-transfer-digital-art.jpg",
  },
  {
    title: "Object Editing",
    description: "Add or remove objects with seamless integration",
    image: "/seamless-object-integration-in-photo.jpg",
  },
  {
    title: "Color Grading",
    description: "Professional color correction and mood enhancement",
    image: "/cinematic-color-grading-photography.jpg",
  },
  {
    title: "Detail Enhancement",
    description: "Enhance image details with AI-powered upscaling",
    image: "/high-detail-enhanced-photography.jpg",
  },
]

export function Showcase() {
  return (
    <section id="showcase" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 md:text-4xl">Showcase Gallery</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Explore stunning examples of what's possible with Nano Banana's AI-powered image editing
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showcaseItems.map((item, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
