import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, planName, price, userId } = body

    console.log('Test payment request:', { planId, planName, price, userId })

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock successful payment response
    const mockPaymentData = {
      id: `test_session_${Date.now()}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id=test_session_${Date.now()}`,
      payment_status: 'paid',
      amount_total: Math.round((price || 9.99) * 100), // Convert to cents
      currency: 'USD',
      subscription: `test_sub_${Date.now()}`,
      customer: `test_cust_${Date.now()}`
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