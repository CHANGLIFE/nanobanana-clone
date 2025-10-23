import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3001",
    "X-Title": process.env.SITE_NAME || "Nano Banana",
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== Pro Image Generation API Called ===")

    const body = await request.json()
    console.log("Request body received:", {
      hasPrompt: !!body.prompt,
      hasImage: !!body.imageBase64,
      promptLength: body.prompt?.length,
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

    // Check image size
    const imageSizeMB = Math.round(imageBase64.length / (1024 * 1024) * 100) / 100
    if (imageSizeMB > 20) {
      console.log("Image too large:", imageSizeMB, "MB")
      return NextResponse.json(
        { error: `Image too large (${imageSizeMB}MB). Please use an image smaller than 20MB.` },
        { status: 400 }
      )
    }

    console.log("Trying different models for image generation...")

    // Add retry mechanism for rate limiting
    let retryCount = 0
    const maxRetries = 3
    let completion

    while (retryCount < maxRetries) {
      try {
        // Try with the original model that should work better
        completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          role: "system",
          content: "You are an AI image editor. Analyze the provided image and create a modified version based on the user's instructions. Return the new image as a base64 data URL starting with 'data:image/'.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I need you to edit this image: ${prompt}. Please create the edited image and return it as a base64 data URL that I can use directly.`,
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
      max_tokens: 4096,
      temperature: 0.8,
    })
        break // Success, exit retry loop
      } catch (apiError: any) {
        retryCount++
        console.log(`API attempt ${retryCount} failed:`, apiError.message)

        if (apiError.status === 429 && retryCount < maxRetries) {
          // Rate limit error, wait before retrying
          const waitTime = Math.pow(2, retryCount) * 2000 // Exponential backoff
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          // Non-retryable error or max retries reached
          throw apiError
        }
      }
    }

    if (!completion) {
      throw new Error("Failed to complete API call after retries")
    }

    console.log("API call completed. Response structure:", {
      choices: completion.choices?.length,
      firstChoice: !!completion.choices?.[0],
      message: !!completion.choices?.[0]?.message,
      content: !!completion.choices?.[0]?.message?.content,
      usage: completion.usage
    })

    // Try different ways to extract content
    const choice = completion.choices[0]
    let responseText = choice?.message?.content

    console.log("Initial content extraction:", {
      hasContent: !!responseText,
      contentLength: responseText?.length,
      messageKeys: choice?.message ? Object.keys(choice.message) : 'no message',
      rawMessage: choice?.message
    })

    // Check for alternative content locations
    if (!responseText && choice?.message) {
      // Check if content is in a different property
      const alternativeKeys = ['text', 'response', 'result', 'output']
      for (const key of alternativeKeys) {
        if (choice.message[key]) {
          responseText = choice.message[key]
          console.log(`Found content in alternative field: ${key}`)
          break
        }
      }
    }

    // Check the entire choice object for any string content
    if (!responseText && choice) {
      const choiceStr = JSON.stringify(choice, null, 2)
      console.log("Full choice object:", choiceStr)

      // Look for any base64 image data in the entire response
      const base64Matches = choiceStr.match(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/g)
      if (base64Matches && base64Matches.length > 0) {
        responseText = base64Matches[0]
        console.log("Found base64 image data in full response")
      }
    }

    console.log("Final extracted content:", {
      hasContent: !!responseText,
      contentLength: responseText?.length,
      contentPreview: responseText?.substring(0, 200)
    })

    if (responseText) {
      console.log("Checking response for image content...")

      // Check for various image data formats
      const imagePatterns = [
        /data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/g,
        /!\[.*?\]\(data:image\/[^)]+\)/g,
        /<img[^>]+src=["']data:image\/[^"']*["'][^>]*>/g
      ]

      let foundImage = false
      let imageData = responseText

      for (const pattern of imagePatterns) {
        const matches = responseText.match(pattern)
        if (matches && matches.length > 0) {
          console.log("Found image data pattern!")
          // Extract the actual data URL
          const dataUrlMatch = matches[0].match(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/)
          if (dataUrlMatch) {
            imageData = dataUrlMatch[0]
            foundImage = true
            break
          }
        }
      }

      if (foundImage) {
        console.log("Successfully extracted image data!")
        return NextResponse.json({
          success: true,
          imageUrl: imageData,
          response: responseText,
          isImage: true
        })
      } else {
        console.log("Text response only, no image generated")
        console.log("Response type checking for markdown images...")

        // Check for markdown image links
        const markdownImageMatch = responseText.match(/!\[.*?\]\((.*?)\)/)
        if (markdownImageMatch && markdownImageMatch[1] && !markdownImageMatch[1].startsWith('data:')) {
          console.log("Found markdown image URL:", markdownImageMatch[1])
          return NextResponse.json({
            success: true,
            imageUrl: markdownImageMatch[1],
            response: responseText,
            isImage: true
          })
        }

        return NextResponse.json({
          success: true,
          response: responseText,
          text: responseText,
          isImage: false
        })
      }
    } else {
      console.log("No content in response")
      return NextResponse.json(
        { success: false, error: "No response from AI model" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in Pro image generation API:", error)
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