import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, planName, price, userId } = body

    console.log('Test payment request:', { planId, planName, price, userId })

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock successful payment response - simulate real Creem API response
    const mockPaymentData = {
      id: `cs_test_${Date.now()}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id=cs_test_${Date.now()}`,
      payment_status: 'unpaid',
      amount_total: Math.round((price || 9.99) * 100), // Convert to cents
      currency: 'USD',
      subscription: `sub_test_${Date.now()}`,
      customer: `cus_test_${Date.now()}`,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id=cs_test_${Date.now()}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
      created: Math.floor(Date.now() / 1000), // Unix timestamp
      mode: 'subscription'
    }

    console.log('Test payment created successfully:', mockPaymentData)

    return NextResponse.json({
      success: true,
      sessionId: mockPaymentData.id,
      paymentUrl: mockPaymentData.url,
      planId,
      planName,
      price,
      isTest: true
    })

  } catch (error) {
    console.error('Test payment error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test payment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test payment endpoint',
    status: 'active',
    description: 'This endpoint simulates payment processing for testing purposes'
  })
}