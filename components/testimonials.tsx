import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Digital Artist",
    content:
      "Nano Banana has completely transformed my workflow. The quality and speed are unmatched. I can iterate on ideas faster than ever before.",
    rating: 5,
    avatar: "/professional-woman-portrait.png",
  },
  {
    name: "Marcus Rodriguez",
    role: "Content Creator",
    content:
      "The natural language interface makes it so easy to get exactly what I want. No more complex tools or steep learning curves.",
    rating: 5,
    avatar: "/professional-man-portrait.png",
  },
  {
    name: "Emily Watson",
    role: "Marketing Director",
    content:
      "Our team productivity has increased 10x. The batch processing feature alone has saved us countless hours of work.",
    rating: 5,
    avatar: "/confident-businesswoman.png",
  },
  {
    name: "David Kim",
    role: "Photographer",
    content:
      "The scene preservation is incredible. I can make dramatic changes while keeping the essence of my original photos intact.",
    rating: 5,
    avatar: "/photographer-portrait.png",
  },
  {
    name: "Lisa Anderson",
    role: "UI/UX Designer",
    content:
      "Perfect for rapid prototyping. I can generate multiple variations of design concepts in minutes instead of hours.",
    rating: 5,
    avatar: "/designer-woman-portrait.jpg",
  },
  {
    name: "James Taylor",
    role: "Social Media Manager",
    content:
      "Game changer for creating engaging content. The quality is consistently high and the results are always impressive.",
    rating: 5,
    avatar: "/social-media-manager-portrait.jpg",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 md:text-4xl">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Join thousands of creators who trust Nano Banana for their image editing needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
