import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3001",
    "X-Title": process.env.SITE_NAME || "Nano Banana",
  },
})

export async function GET() {
  try {
    console.log("Testing OpenRouter connection...")
    console.log("API Key:", process.env.OPENROUTER_API_KEY?.substring(0, 10) + "...")
    console.log("Base URL:", process.env.OPENROUTER_BASE_URL)

    // Test with a simple text request first
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          role: "user",
          content: "Hello, can you respond with just 'API working'?",
        },
      ],
    })

    const responseText = completion.choices[0]?.message?.content
    console.log("Simple test response:", responseText)

    return NextResponse.json({
      success: true,
      response: responseText,
      message: "OpenRouter connection successful"
    })
  } catch (error) {
    console.error("OpenRouter test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.name : 'Unknown',
        apiKeyPresent: !!process.env.OPENROUTER_API_KEY,
        apiKeyLength: process.env.OPENROUTER_API_KEY?.length
      },
      { status: 500 }
    )
  }
}