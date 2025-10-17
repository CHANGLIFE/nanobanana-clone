import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is Nano Banana?",
    answer:
      "Nano Banana is an advanced AI-powered image editing platform that uses natural language processing to transform images. Simply describe what you want, and our AI model will make it happen while preserving character consistency and scene integrity.",
  },
  {
    question: "How does it compare to other AI image editors?",
    answer:
      "Nano Banana outperforms competitors like Flux Kontext in character consistency, scene preservation, and natural language understanding. Our model delivers faster results with higher quality output, making it the preferred choice for professionals.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support all major image formats including JPG, PNG, WebP, and HEIC. You can upload images up to 50MB in size. The output format matches your input format by default, but you can choose your preferred format.",
  },
  {
    question: "Can I process multiple images at once?",
    answer:
      "Yes! Our batch processing feature allows you to process multiple images simultaneously with consistent styling and quality. This is perfect for large projects or when you need to apply the same edits to multiple photos.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, we offer a free trial that includes 10 image generations. No credit card required. You can upgrade to a paid plan anytime to unlock unlimited generations and advanced features.",
  },
  {
    question: "How long does it take to generate an image?",
    answer:
      "Most images are generated in 5-15 seconds depending on complexity. Our ultra-fast processing ensures you can iterate quickly and see results almost instantly.",
  },
  {
    question: "Can I use the generated images commercially?",
    answer:
      "Yes, all images generated with Nano Banana are yours to use commercially. You retain full rights to your creations and can use them for any purpose including commercial projects.",
  },
  {
    question: "What kind of edits can I make?",
    answer:
      "You can make virtually any edit using natural language: change backgrounds, modify objects, adjust lighting, apply artistic styles, enhance details, change colors, add or remove elements, and much more. If you can describe it, we can create it.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 md:text-4xl">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Everything you need to know about Nano Banana
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
