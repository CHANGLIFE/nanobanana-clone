import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, planName } = await request.json()

    // Validate required fields
    if (!userId || !planId || !planName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, planId, planName'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    // Check if user already has an active free plan
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingSubscription && existingSubscription.plan_id === 'free') {
      return NextResponse.json(
        {
          success: false,
          error: 'Free plan already active'
        },
        { status: 409 }
      )
    }

    // Activate free plan
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: 'free',
        plan_name: 'Free Plan',
        status: 'active',
        current_period_start: new Date().toISOString(),
        creem_customer_id: null, // Free plans don't have external payment
        creem_subscription_id: null,
        creem_session_id: null
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Free plan activation error:', subscriptionError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to activate free plan',
          details: subscriptionError.message
        },
        { status: 500 }
      )
    }

    // Add credits for free plan
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        credits: 10, // Free plan gets 10 credits
        last_reset: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (creditsError) {
      console.error('Credits assignment error:', creditsError)
      // Don't fail the whole operation if credits fail, but log it
    }

    console.log('Free plan activated successfully:', {
      userId,
      planId,
      subscriptionId: subscription.id,
      creditsAssigned: credits?.credits
    })

    return NextResponse.json({
      success: true,
      message: 'Free plan activated successfully',
      subscription,
      credits: credits?.credits || 0
    })

  } catch (error) {
    console.error('Free plan activation server error:', error)
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
    message: 'Free plan activation endpoint',
    status: 'active',
    description: 'This endpoint activates a free subscription plan for users'
  })
}