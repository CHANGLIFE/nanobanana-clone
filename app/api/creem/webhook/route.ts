import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify Creem webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
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
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET environment variable is not set')
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      )
    }

    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    console.log('Received Creem webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handlePaymentSuccess(event.data)
        break

      case 'invoice.payment_succeeded':
        await handleRecurringPayment(event.data)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(sessionData: any) {
  const { customer, metadata, subscription } = sessionData
  const { planId, planName, userId } = metadata

  console.log('Processing successful payment:', {
    customerId: customer,
    userId,
    planId,
    planName,
    subscriptionId: subscription
  })

  try {
    // Update user's subscription in database
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        plan_name: planName,
        creem_customer_id: customer,
        creem_subscription_id: subscription,
        status: 'active',
        current_period_start: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    // Add credits to user account
    await addUserCredits(userId, planId)

    console.log('Payment processed successfully for user:', userId)

  } catch (error) {
    console.error('Error processing payment success:', error)
    throw error
  }
}

async function handleRecurringPayment(invoiceData: any) {
  const { customer, subscription } = invoiceData

  console.log('Processing recurring payment:', {
    customerId: customer,
    subscriptionId: subscription
  })

  try {
    // Update subscription period
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', subscription)

    if (error) {
      console.error('Error updating subscription:', error)
      throw error
    }

    // Get user and plan info to add credits
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('user_id, plan_id')
      .eq('creem_subscription_id', subscription)
      .single()

    if (subscription) {
      await addUserCredits(subscription.user_id, subscription.plan_id)
    }

  } catch (error) {
    console.error('Error processing recurring payment:', error)
    throw error
  }
}

async function handlePaymentFailure(invoiceData: any) {
  const { customer, subscription } = invoiceData

  console.log('Processing payment failure:', {
    customerId: customer,
    subscriptionId: subscription
  })

  try {
    // Update subscription status
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', subscription)

    if (error) {
      console.error('Error updating subscription status:', error)
      throw error
    }

  } catch (error) {
    console.error('Error processing payment failure:', error)
    throw error
  }
}

async function handleSubscriptionCancellation(subscriptionData: any) {
  const { customer, id } = subscriptionData

  console.log('Processing subscription cancellation:', {
    customerId: customer,
    subscriptionId: id
  })

  try {
    // Update subscription status to cancelled
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', id)

    if (error) {
      console.error('Error processing subscription cancellation:', error)
      throw error
    }

  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
    throw error
  }
}

async function addUserCredits(userId: string, planId: string) {
  const creditAmounts: { [key: string]: number } = {
    'free': 10,
    'pro': 500,
    'enterprise': 2000
  }

  const credits = creditAmounts[planId] || 0

  if (credits > 0) {
    const { error } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        credits: credits,
        last_reset: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error adding user credits:', error)
      throw error
    }

    console.log(`Added ${credits} credits to user ${userId}`)
  }
}

// Handle webhook verification requests from Creem
export async function GET() {
  return NextResponse.json({
    status: 'webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}