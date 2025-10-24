import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreemAPI } from '@/lib/creem'

interface CreemWebhookEvent {
  id: string
  object: string
  api_version: string
  created: number
  data: {
    object: {
      id?: string
      status?: string
      customer?: string
      subscription?: string
      amount_total?: number
      currency?: string
      payment_status?: string
      metadata?: Record<string, any>
      created?: number
    }
  }
  type: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('creem-signature')

    if (!signature) {
      console.error('Missing Creem signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    if (!CreemAPI.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log('Received Creem webhook event:', {
      hasSignature: !!signature,
      bodyLength: body.length
    })

    let event: CreemWebhookEvent
    try {
      event = JSON.parse(body)
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    console.log('Processing Creem webhook event:', {
      id: event.id,
      type: event.type,
      object: event.object,
      created: new Date(event.created * 1000).toISOString()
    })

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handlePaymentCompleted(event, supabase)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(event, supabase)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event, supabase)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event, supabase)
        break

      case 'payment.failed':
        await handlePaymentFailed(event, supabase)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handlePaymentCompleted(event: CreemWebhookEvent, supabase: any) {
  console.log('Handling payment completed event:', event.id)

  const sessionData = event.data.object

  // Extract plan information from metadata
  const metadata = sessionData.metadata || {}
  const planId = metadata.planId || 'pro'
  const planName = metadata.planName || 'Pro Plan'
  const userId = metadata.userId || sessionData.customer

  // Update or create subscription record
  const { data: subscription, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      plan_name: planName,
      creem_customer_id: sessionData.customer,
      creem_subscription_id: sessionData.subscription,
      creem_session_id: sessionData.id,
      status: sessionData.payment_status === 'paid' ? 'active' : 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: sessionData.created ?
        new Date(sessionData.created * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    }, {
      onConflict: 'creem_session_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to update subscription:', error)
    throw error
  }

  // Add credits if payment is successful
  if (sessionData.payment_status === 'paid') {
    await addCreditsToUser(userId, planId, supabase)
  }

  console.log('Payment completed webhook processed:', {
    userId,
    planId,
    sessionId: sessionData.id,
    subscriptionId: sessionData.subscription
  })
}

async function handlePaymentSucceeded(event: CreemWebhookEvent, supabase: any) {
  console.log('Handling payment succeeded event:', event.id)
  // Similar to payment completed
  await handlePaymentCompleted(event, supabase)
}

async function handleInvoicePaid(event: CreemWebhookEvent, supabase: any) {
  console.log('Handling invoice paid event:', event.id)

  const invoiceData = event.data.object
  if (invoiceData.subscription) {
    // This is a subscription renewal
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date().toISOString()
      })
      .eq('creem_subscription_id', invoiceData.subscription)
      .select()
      .single()

    if (subscription) {
      const metadata = invoiceData.metadata || {}
      const planId = metadata.planId || 'pro'

      await addCreditsToUser(subscription.user_id, planId, supabase)
      console.log('Subscription renewal processed:', {
        subscriptionId: invoiceData.subscription,
        userId: subscription.user_id
      })
    }
  }
}

async function handleSubscriptionCreated(event: CreemWebhookEvent, supabase: any) {
  console.log('Handling subscription created event:', event.id)
  // Similar to payment completed
  await handlePaymentCompleted(event, supabase)
}

async function handleSubscriptionUpdated(event: CreemWebhookEvent, supabase: any) {
  console.log('Handling subscription updated event:', event.id)

  const subscriptionData = event.data.object
  if (subscriptionData.customer && subscriptionData.id) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', subscriptionData.id)
      .select()
      .single()
  }
}

async function handleSubscriptionCancelled(event: CreemWebhookEvent, supabase: any) {
  console.log('Handling subscription cancelled event:', event.id)

  const subscriptionData = event.data.object
  if (subscriptionData.customer && subscriptionData.id) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', subscriptionData.id)
      .select()
      .single()
  }
}

async function handlePaymentFailed(event: CreemWebhookEvent, supabase: any) {
  console.log('Handling payment failed event:', event.id)

  const paymentData = event.data.object
  if (paymentData.metadata && paymentData.metadata.session_id) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('creem_session_id', paymentData.metadata.session_id)
      .select()
      .single()
  }
}

async function addCreditsToUser(userId: string, planId: string, supabase: any) {
  const creditAmounts: { [key: string]: number } = {
    'free': 10,
    'pro': 500,
    'enterprise': 2000
  }

  const credits = creditAmounts[planId] || 0

  const { error } = await supabase
    .from('user_credits')
    .upsert({
      user_id: userId,
      credits: credits,
      last_reset: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to add credits:', error)
  } else {
    console.log(`Added ${credits} credits to user ${userId}`)
  }
}

// Verify webhook endpoint accessibility
export async function GET() {
  return NextResponse.json({
    service: 'Creem Webhook Handler',
    status: 'active',
    version: '1.0.0',
    testMode: CreemAPI.isInTestMode(),
    events: [
      'checkout.session.completed',
      'payment.succeeded',
      'invoice.paid',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'payment.failed'
    ]
  })
}