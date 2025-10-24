import { NextRequest, NextResponse } from 'next/server'
import { CreemAPI, CreemPaymentRequest } from '@/lib/creem'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreemPaymentRequest & { planId: string; planName: string } = await request.json()
    const { planId, planName, price, userId, customerEmail } = body

    // Validate required fields
    if (!planId || !planName || price === undefined || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: planId, planName, price, userId'
        },
        { status: 400 }
      )
    }

    // Check Creem configuration
    if (!CreemAPI.isConfigured()) {
      console.error('Creem API not configured properly')
      return NextResponse.json(
        {
          success: false,
          error: 'Payment service not configured',
          details: 'Missing API credentials'
        },
        { status: 500 }
      )
    }

    console.log('Creating Creem payment session:', {
      planId,
      planName,
      amount: price,
      userId,
      testMode: CreemAPI.isInTestMode()
    })

    // Prepare payment request
    const paymentRequest: CreemPaymentRequest = {
      amount: price,
      currency: 'USD',
      description: `Nano Banana ${planName} Subscription`,
      customer_id: userId,
      customer_email: customerEmail,
      metadata: {
        planId,
        planName,
        userId,
        type: 'subscription',
        source: 'nanobanana_web',
        timestamp: new Date().toISOString()
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      mode: 'subscription'
    }

    // Create payment session
    if (CreemAPI.isInTestMode()) {
      // Use test payment
      const testSession = CreemAPI.createTestPaymentSession(paymentRequest)

      console.log('Test payment session created:', {
        sessionId: testSession.id,
        amount: price,
        planId
      })

      return NextResponse.json({
        success: true,
        sessionId: testSession.id,
        paymentUrl: testSession.url,
        planId,
        planName,
        price,
        isTest: true
      })

    } else {
      // Use real Creem API
      const result = await CreemAPI.createPaymentSession(paymentRequest)

      if (result.success && result.data) {
        console.log('Real Creem payment session created:', {
          sessionId: result.data.id,
          amount: price,
          planId
        })

        return NextResponse.json({
          success: true,
          sessionId: result.data.id,
          paymentUrl: result.data.url,
          planId,
          planName,
          price,
          isTest: false
        })
      } else {
        console.error('Creem API error:', result.error)

        return NextResponse.json(
          {
            success: false,
            error: 'Payment session creation failed',
            details: result.error?.message || result.error?.error || 'Unknown error',
            code: result.error?.code
          },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error('Error creating payment session:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Creem Payment API',
    status: 'active',
    testMode: CreemAPI.isInTestMode(),
    configured: CreemAPI.isConfigured(),
    version: '1.0.0'
  })
}