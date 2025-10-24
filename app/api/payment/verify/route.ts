import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    // Get Creem API credentials
    const creemApiKey = process.env.CREEM_API_KEY
    const creemApiBase = process.env.CREEM_API_BASE || 'https://api.creem.io'

    if (!creemApiKey) {
      console.error('CREEM_API_KEY environment variable is not set')
      return NextResponse.json(
        { success: false, error: 'Payment service configuration error' },
        { status: 500 }
      )
    }

    // Retrieve session from Creem
    const creemResponse = await fetch(`${creemApiBase}/v1/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${creemApiKey}`,
        'Content-Type': 'application/json',
      }
    })

    const sessionData = await creemResponse.json()

    if (!creemResponse.ok) {
      console.error('Creem API error:', sessionData)
      return NextResponse.json(
        { success: false, error: 'Unable to verify payment' },
        { status: 500 }
      )
    }

    // Check if payment was successful
    if (sessionData.payment_status !== 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not completed',
          status: sessionData.payment_status
        },
        { status: 400 }
      )
    }

    // Get user subscription details from database
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        user_credits (
          credits,
          last_reset
        )
      `)
      .eq('creem_session_id', sessionId)
      .single()

    if (error || !subscription) {
      console.error('Subscription not found:', error)
      return NextResponse.json(
        { success: false, error: 'Subscription information not found' },
        { status: 404 }
      )
    }

    // Get credit amounts for plans
    const creditAmounts: { [key: string]: number } = {
      'free': 10,
      'pro': 500,
      'enterprise': 2000
    }

    const credits = creditAmounts[subscription.plan_id] || 0

    return NextResponse.json({
      success: true,
      sessionId,
      planName: subscription.plan_name,
      planId: subscription.plan_id,
      credits: credits,
      status: subscription.status,
      amount: sessionData.amount_total / 100, // Convert from cents to dollars
      currency: sessionData.currency,
      paymentDate: subscription.current_period_start
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Payment verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}