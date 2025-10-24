import { NextRequest, NextResponse } from 'next/server'

interface CreemPaymentRequest {
  planId: string
  planName: string
  price: number
  userId: string
  customerEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreemPaymentRequest = await request.json()
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

    // Get Creem API credentials from environment variables
    const creemApiKey = process.env.CREEM_API_KEY
    const creemApiBase = process.env.CREEM_API_BASE || 'https://api.creem.io'

    if (!creemApiKey) {
      console.error('CREEM_API_KEY environment variable is not set')
      return NextResponse.json(
        {
          success: false,
          error: 'Payment service configuration error'
        },
        { status: 500 }
      )
    }

    // Create payment session with Creem
    const paymentData = {
      amount: Math.round(price * 100), // Convert to cents
      currency: 'USD',
      description: `Nano Banana ${planName} Plan`,
      customer_id: userId,
      metadata: {
        planId,
        planName,
        userId,
        type: 'subscription'
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
      billing_address_collection: 'required',
      customer_email: customerEmail,
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      mode: 'subscription' // For recurring payments
    }

    console.log('Creating Creem payment session:', {
      planId,
      planName,
      amount: paymentData.amount,
      userId
    })

    // Make request to Creem API
    const creemResponse = await fetch(`${creemApiBase}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creemApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const creemData = await creemResponse.json()

    if (!creemResponse.ok) {
      console.error('Creem API error:', creemData)
      return NextResponse.json(
        {
          success: false,
          error: 'Payment service unavailable',
          details: creemData.error || 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Log payment session creation
    console.log('Creem payment session created successfully:', {
      sessionId: creemData.id,
      paymentUrl: creemData.url,
      planId,
      userId
    })

    return NextResponse.json({
      success: true,
      sessionId: creemData.id,
      paymentUrl: creemData.url,
      planId,
      planName,
      price
    })

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
    message: 'Creem payment API endpoint',
    status: 'active'
  })
}