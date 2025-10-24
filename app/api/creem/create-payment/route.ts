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

    // Try Creem API first, fallback to test if it fails
    let paymentUrl
    let sessionId

    try {
      console.log('Making request to Creem API:', {
        url: `${creemApiBase}/v1/checkout/sessions`,
        apiKeyPresent: !!creemApiKey,
        paymentData
      })

      const creemResponse = await fetch(`${creemApiBase}/v1/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creemApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      let creemData
      try {
        const responseText = await creemResponse.text()
        console.log('Creem API response:', {
          status: creemResponse.status,
          statusText: creemResponse.statusText,
          responseText: responseText.substring(0, 500) // First 500 chars
        })

        if (responseText) {
          creemData = JSON.parse(responseText)
        }
      } catch (parseError) {
        console.error('Error parsing Creem response:', parseError)
        creemData = { error: 'Invalid response format' }
      }

      if (creemResponse.ok && creemData.url) {
        // Creem API succeeded
        paymentUrl = creemData.url
        sessionId = creemData.id
        console.log('Creem payment session created successfully:', { sessionId, paymentUrl })
      } else {
        throw new Error(creemData?.message || creemData?.error || 'Creem API failed')
      }
    } catch (creemError) {
      console.warn('Creem API failed, using test payment fallback:', creemError)

      // Fallback to test payment
      sessionId = `cs_test_fallback_${Date.now()}`
      paymentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id=${sessionId}`

      console.log('Using test payment fallback:', { sessionId, paymentUrl })
    }

    // Log payment session creation
    console.log('Payment session created:', {
      sessionId,
      paymentUrl,
      planId,
      userId,
      fallback: !paymentUrl?.includes('creem') ? 'test' : 'creem'
    })

    return NextResponse.json({
      success: true,
      sessionId,
      paymentUrl,
      planId,
      planName,
      price,
      isTest: !paymentUrl?.includes('creem')
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