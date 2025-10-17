import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3001",
    "X-Title": process.env.SITE_NAME || "Nano Banana",
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Route Called ===")

    const body = await request.json()
    console.log("Request body received:", {
      hasPrompt: !!body.prompt,
      hasImage: !!body.imageBase64,
      promptLength: body.prompt?.length,
      imageType: body.imageBase64?.split(',')[0]?.split(':')[1]?.split(';')[0],
      imageSize: body.imageBase64?.length,
      imageSizeMB: Math.round((body.imageBase64?.length || 0) / (1024 * 1024) * 100) / 100
    })

    const { prompt, imageBase64 } = body

    if (!prompt || !imageBase64) {
      console.log("Missing required fields:", { hasPrompt: !!prompt, hasImage: !!imageBase64 })
      return NextResponse.json(
        { error: "Prompt and image are required" },
        { status: 400 }
      )
    }

    // Check image size (OpenRouter has limits, typically around 20MB)
    const imageSizeMB = Math.round(imageBase64.length / (1024 * 1024) * 100) / 100
    if (imageSizeMB > 20) {
      console.log("Image too large:", imageSizeMB, "MB")
      return NextResponse.json(
        { error: `Image too large (${imageSizeMB}MB). Please use an image smaller than 20MB.` },
        { status: 400 }
      )
    }

    console.log("Making API call to OpenRouter...")

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Based on the uploaded image, ${prompt}. Generate a new image according to your description. Please provide the image directly.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      response_format: { type: "text" },
      max_tokens: 2048,
    })

    console.log("API call completed. Response structure:", {
      choices: completion.choices?.length,
      firstChoice: !!completion.choices?.[0],
      message: !!completion.choices?.[0]?.message,
      content: !!completion.choices?.[0]?.message?.content,
      usage: completion.usage
    })

    const responseText = completion.choices[0]?.message?.content

    console.log("Gemini API Response length:", responseText?.length)
    console.log("Gemini API Response preview:", responseText?.substring(0, 200))

    if (responseText) {
      return NextResponse.json({
        success: true,
        response: responseText,
        text: responseText,
      })
    } else {
      console.log("No content in response")
      return NextResponse.json(
        { success: false, error: "No response from AI model" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in API route:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}