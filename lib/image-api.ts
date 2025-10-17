export interface ImageGenerationRequest {
  prompt: string
  imageBase64: string
}

export interface ImageGenerationResponse {
  success: boolean
  imageUrl?: string
  response?: string
  text?: string
  error?: string
}

export async function generateImageWithGemini(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  try {
    console.log("=== Client: Starting API call ===")
    console.log("Request data:", {
      promptLength: request.prompt?.length,
      hasImage: !!request.imageBase64,
      imageType: request.imageBase64?.split(',')[0]?.split(':')[1]?.split(';')[0]
    })

    const response = await fetch('/api/generate-image-pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)

    const data = await response.json()
    console.log("Response data:", data)

    if (!response.ok) {
      console.error("API call failed:", data)
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
        details: data.details
      }
    }

    console.log("API call successful:", data.success)
    return data
  } catch (error) {
    console.error("Network error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error instanceof Error ? error.name : 'Network Error'
    }
  }
}