// Creem Payment API Library
// Based on common payment API patterns and best practices

export interface CreemPaymentRequest {
  amount: number
  currency?: string
  description?: string
  customer_id?: string
  customer_email?: string
  metadata?: Record<string, any>
  success_url?: string
  cancel_url?: string
  payment_method_types?: string[]
  mode?: 'payment' | 'subscription'
}

export interface CreemPaymentResponse {
  id: string
  url?: string
  payment_status?: string
  amount_total: number
  currency: string
  customer?: string
  subscription?: string
  created?: number
  mode?: string
}

export interface CreemError {
  error: string
  message?: string
  type?: string
  code?: string
}

export class CreemAPI {
  private static readonly TEST_MODE = process.env.NODE_ENV === 'development'
  private static readonly API_BASE = process.env.CREEM_API_BASE || 'https://api.creem.io'
  private static readonly API_KEY = process.env.CREEM_API_KEY
  private static readonly WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET

  /**
   * Create a payment session
   */
  static async createPaymentSession(request: CreemPaymentRequest): Promise<{
    success: boolean
    data?: CreemPaymentResponse
    error?: CreemError
  }> {
    try {
      // Log payment request
      console.log('Creating Creem payment session:', {
        amount: request.amount,
        currency: request.currency || 'USD',
        description: request.description,
        testMode: this.TEST_MODE,
        apiBase: this.API_BASE,
        hasApiKey: !!this.API_KEY
      })

      // Prepare request payload
      const payload = {
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency || 'USD',
        description: request.description || 'Nano Banana Payment',
        customer_id: request.customer_id,
        customer_email: request.customer_email,
        metadata: {
          ...request.metadata,
          source: 'nanobanana_web',
          version: '1.0.0'
        },
        success_url: request.success_url || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: request.cancel_url || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
        payment_method_types: request.payment_method_types || ['card', 'apple_pay', 'google_pay'],
        mode: request.mode || 'payment',
        billing_address_collection: 'required'
      }

      // Make API request
      const response = await fetch(`${this.API_BASE}/v1/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'NanoBanana/1.0.0'
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()
      console.log('Creem API response:', {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 1000)
      })

      // Parse response
      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error('Failed to parse Creem response:', parseError)
        return {
          success: false,
          error: { error: 'Invalid response format', type: 'api_error' }
        }
      }

      if (response.ok && responseData.id) {
        // Success
        console.log('Creem payment session created successfully:', {
          sessionId: responseData.id,
          url: responseData.url,
          amount: request.amount
        })

        return {
          success: true,
          data: responseData as CreemPaymentResponse
        }
      } else {
        // API Error
        console.error('Creem API error:', {
          status: response.status,
          responseData
        })

        return {
          success: false,
          error: {
            error: responseData.error || responseData.message || 'Unknown error',
            type: 'api_error',
            code: response.status.toString(),
            message: responseData.message || 'Payment session creation failed'
          }
        }
      }

    } catch (networkError) {
      console.error('Network error creating Creem payment session:', networkError)
      return {
        success: false,
        error: {
          error: 'Network error',
          type: 'network_error',
          message: networkError instanceof Error ? networkError.message : 'Unknown network error'
        }
      }
    }
  }

  /**
   * Retrieve a payment session
   */
  static async retrievePaymentSession(sessionId: string): Promise<{
    success: boolean
    data?: CreemPaymentResponse
    error?: CreemError
  }> {
    try {
      console.log('Retrieving Creem payment session:', {
        sessionId,
        testMode: this.TEST_MODE,
        hasApiKey: !!this.API_KEY
      })

      const response = await fetch(`${this.API_BASE}/v1/checkout/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'NanoBanana/1.0.0'
        }
      })

      const responseText = await response.text()
      console.log('Creem retrieve response:', {
        status: response.status,
        responseText: responseText.substring(0, 1000)
      })

      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error('Failed to parse Creem retrieve response:', parseError)
        return {
          success: false,
          error: { error: 'Invalid response format', type: 'api_error' }
        }
      }

      if (response.ok && responseData.id) {
        return {
          success: true,
          data: responseData as CreemPaymentResponse
        }
      } else {
        return {
          success: false,
          error: {
            error: responseData.error || responseData.message || 'Session not found',
            type: 'api_error',
            code: response.status.toString(),
            message: responseData.message || 'Failed to retrieve payment session'
          }
        }
      }

    } catch (networkError) {
      console.error('Network error retrieving Creem session:', networkError)
      return {
        success: false,
        error: {
          error: 'Network error',
          type: 'network_error',
          message: networkError instanceof Error ? networkError.message : 'Unknown network error'
        }
      }
    }
  }

  /**
   * Create a test payment session (for development)
   */
  static createTestPaymentSession(request: CreemPaymentRequest): CreemPaymentResponse {
    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      id: sessionId,
      url: request.success_url?.replace('{CHECKOUT_SESSION_ID}', sessionId) || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id=${sessionId}`,
      payment_status: 'paid', // Test payments are always successful
      amount_total: Math.round(request.amount * 100),
      currency: request.currency || 'USD',
      customer: `cus_test_${Date.now()}`,
      subscription: request.mode === 'subscription' ? `sub_test_${Date.now()}` : undefined,
      created: Math.floor(Date.now() / 1000),
      mode: request.mode || 'payment'
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto')

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.WEBHOOK_SECRET)
        .update(payload)
        .digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  /**
   * Check if API is properly configured
   */
  static isConfigured(): boolean {
    return !!(this.API_KEY && this.API_BASE && this.WEBHOOK_SECRET)
  }

  /**
   * Check if in test mode
   */
  static isInTestMode(): boolean {
    return this.TEST_MODE || this.API_KEY?.startsWith('test_') || this.API_KEY?.startsWith('sk_test_')
  }
}