"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Sparkles, Loader2 } from "lucide-react"
import { generateImageWithGemini } from "@/lib/image-api"

export function Editor() {
  const [prompt, setPrompt] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("File selected:", {
        name: file.name,
        size: file.size,
        sizeMB: Math.round(file.size / (1024 * 1024) * 100) / 100,
        type: file.type
      })

      // Check file size (10MB limit for better reliability)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large (${Math.round(file.size / (1024 * 1024) * 100) / 100}MB). Please use an image smaller than 10MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log("File read complete, data URL length:", result.length)
        setSelectedImage(result)
        setError(null)
      }
      reader.onerror = (error) => {
        console.error("File reading error:", error)
        setError("Failed to read image file")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedImage) {
      setError("Please upload an image and enter a prompt")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateImageWithGemini({
        prompt: prompt.trim(),
        imageBase64: selectedImage,
      })

      if (result.success && (result.imageUrl || result.response || result.text)) {
        const displayContent = result.imageUrl || result.response || result.text
        console.log("Generated content:", displayContent)
        setGeneratedImages(prev => [...prev, displayContent])
      } else {
        const errorMessage = result.error || "Failed to generate response"
        const errorDetails = result.details ? ` (${result.details})` : ""
        setError(errorMessage + errorDetails)
        console.error("Generation failed:", { error: errorMessage, details: result.details, fullResult: result })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section id="editor" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-5xl text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 md:text-4xl">Try The AI Editor</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Experience the power of nano-banana's natural language image editing. Transform any photo with simple text commands
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Prompt Engine */}
          <Card className="p-6 border-2 border-primary/20">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Prompt Engine</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Transform your image with AI-powered editing</p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Reference Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {selectedImage ? (
                      <img
                        src={selectedImage || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-h-[200px] rounded-lg object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Add Image</span>
                        <span className="text-xs text-muted-foreground">Max 50MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Main Prompt</label>
                <Textarea
                  placeholder="Make this image cinematic, Add golden hour lighting, Convert to anime style, Make it look futuristic..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || !selectedImage || isGenerating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Now
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Output Gallery */}
          <Card className="p-6 border-2 border-primary/20">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Output Gallery</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Your ultra-fast AI creations appear here instantly</p>

            {generatedImages.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {generatedImages.map((content, index) => (
                  <div key={index} className="rounded-lg border border-border p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Response {index + 1}</span>
                    </div>
                    {content.startsWith('data:image') ? (
                      <img
                        src={content}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-auto rounded-lg object-cover"
                      />
                    ) : content.startsWith('http') ? (
                      <img
                        src={content}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-auto rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-sm text-foreground whitespace-pre-wrap">
                        {content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="mb-2 font-semibold">
                    {isGenerating ? "Generating..." : "Ready for Instant generation"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isGenerating ? "Creating your masterpiece..." : "Enter your prompt and unleash the power"}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
