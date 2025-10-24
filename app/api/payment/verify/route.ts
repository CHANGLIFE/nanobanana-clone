import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreemAPI } from '@/lib/creem'

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

    console.log('Verifying payment session:', {
      sessionId,
      testMode: CreemAPI.isInTestMode()
    })

    // Check if this is a test session
    const isTestSession = CreemAPI.isInTestMode() ||
      sessionId.startsWith('cs_test_') ||
      sessionId.includes('test_session') ||
      sessionId.startsWith('test_')

    if (isTestSession) {
      // Handle test payment verification
      console.log('Processing test payment verification:', sessionId)

      // Extract plan info from session ID or use default
      let planId = 'pro'
      let planName = 'Pro Plan'
      let credits = 500

      if (sessionId.includes('free')) {
        planId = 'free'
        planName = 'Free Plan'
        credits = 10
      } else if (sessionId.includes('enterprise')) {
        planId = 'enterprise'
        planName = 'Enterprise Plan'
        credits = 2000
      }

      // In test mode, we don't need to check database, just return test data
      return NextResponse.json({
        success: true,
        sessionId,
        planName,
        planId,
        credits,
        status: 'active',
        amount: planId === 'free' ? 0 : (planId === 'pro' ? 9.99 : 29.99),
        currency: 'USD',
        paymentDate: new Date().toISOString(),
        isTest: true,
        mode: 'test'
      })
    }

    // Handle real payment verification
    if (!CreemAPI.isConfigured()) {
      console.error('Creem API not configured for real payment verification')
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification service not configured',
          details: 'Missing Creem API credentials'
        },
        { status: 500 }
      )
    }

    try {
      // Retrieve session from Creem
      const result = await CreemAPI.retrievePaymentSession(sessionId)

      if (!result.success || !result.data) {
        console.error('Failed to retrieve payment session:', result.error)
        return NextResponse.json(
          {
            success: false,
            error: 'Payment verification failed',
            details: result.error?.message || result.error?.error || 'Unable to retrieve payment session'
          },
          { status: 500 }
        )
      }

      const sessionData = result.data!

      // Check if payment was successful
      if (sessionData.payment_status !== 'paid' && sessionData.payment_status !== 'complete') {
        console.log('Payment not completed:', {
          sessionId,
          status: sessionData.payment_status
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Payment not completed',
            status: sessionData.payment_status,
            details: `Payment status is: ${sessionData.payment_status}`
          },
          { status: 400 }
        )
      }

      // Get user subscription details from database
      const supabase = await createClient()
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
        console.error('Subscription not found in database:', error)

        // For real payments, if no subscription found, create one
        const planInfo = extractPlanInfo(sessionData.metadata || {})

        const { data: newSubscription, error: createError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: sessionData.customer || sessionData.metadata?.userId,
            plan_id: planInfo.planId,
            plan_name: planInfo.planName,
            creem_customer_id: sessionData.customer,
            creem_session_id: sessionId,
            creem_subscription_id: sessionData.subscription,
            status: 'active',
            current_period_start: new Date().toISOString()
          }, {
            onConflict: 'creem_session_id'
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create subscription record:', createError)
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to create subscription record',
              details: createError.message
            },
            { status: 500 }
          )
        }

        // Add credits for new subscription
        const creditAmounts: { [key: string]: number } = {
          'free': 10,
          'pro': 500,
          'enterprise': 2000
        }

        const credits = creditAmounts[planInfo.planId] || 0

        const { data: creditsRecord, error: creditsError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: sessionData.customer || sessionData.metadata?.userId,
            credits: credits,
            last_reset: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single()

        if (creditsError) {
          console.error('Failed to create credits record:', creditsError)
        }

        return NextResponse.json({
          success: true,
          sessionId,
          planName: planInfo.planName,
          planId: planInfo.planId,
          credits: credits,
          status: 'active',
          amount: (sessionData.amount_total || 0) / 100,
          currency: sessionData.currency || 'USD',
          paymentDate: new Date().toISOString(),
          isTest: false,
          newSubscription: true
        })
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
        credits,
        status: subscription.status,
        amount: (sessionData.amount_total || 0) / 100,
        currency: sessionData.currency || 'USD',
        paymentDate: subscription.current_period_start,
        isTest: false
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
  } catch (error) {
    console.error('Server error during payment verification:', error)
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

function extractPlanInfo(metadata: Record<string, any>): { planId: string; planName: string } {
  const planId = metadata.planId || 'pro'
  const planName = metadata.planName || 'Pro Plan'

  return { planId, planName }
}

export async function POST() {
  return NextResponse.json({
    message: 'Payment verification endpoint',
    method: 'GET only',
    status: 'active'
  })
}