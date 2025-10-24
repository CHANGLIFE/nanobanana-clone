import { NextResponse } from 'next/server'

// Mock user data for when Supabase is not configured
const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: {
    plan: 'free',
    subscription_id: null
  }
}

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mock user data for when Supabase is not configured
const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: {
    name: 'Demo User',
    plan: 'free',
    subscription_id: null
  }
}

export async function GET() {
  try {
    // Check if Supabase is properly configured first
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning mock user')
      return NextResponse.json({
        user: mockUser,
        configured: false,
        message: 'Using mock user data - configure Supabase for production'
      })
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Get user error:', error)

      // Check if it's a configuration error
      if (error.message?.includes('Supabase not configured')) {
        return NextResponse.json({
          user: mockUser,
          configured: false,
          message: 'Supabase not configured - using mock data'
        })
      }

      return NextResponse.json({
        error: error.message,
        user: mockUser,
        configured: false,
      })
    }

    // Handle cases where user is null (e.g., first-time setup)
    if (!data.user) {
      // For first-time setup or when database is empty, create a basic user record
      console.log('No user data found, checking if this is initial setup')

      // Check if we can access the database
      try {
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', mockUser.id)
          .single()

        if (!subscriptionData && !error) {
          console.log('No subscription found, this might be initial setup')

          // Create a basic subscription for the user
          const { data: newSubscription } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: mockUser.id,
              plan_id: 'free',
              plan_name: 'Free Plan',
              status: 'active',
              creem_customer_id: null,
              creem_subscription_id: null,
              creem_session_id: null
            })
            .select()
            .single()

          if (newSubscription) {
            console.log('Created initial subscription for mock user:', newSubscription.id)
          }

          return NextResponse.json({
            user: mockUser,
            configured: true,
            message: 'Created initial subscription for mock user',
            subscription: newSubscription
          })
        } else {
          console.log('Found existing subscription for mock user:', subscriptionData)
          return NextResponse.json({
            user: mockUser,
            configured: true,
            message: 'Using existing subscription for mock user',
            subscription: subscriptionData
          })
        }
      } else {
        console.log('Error checking subscription data:', subscriptionError)
        return NextResponse.json({
          error: 'Failed to check subscription',
          user: mockUser,
          configured: false
        })
      }

      return NextResponse.json({
        user: data.user,
        configured: true,
        message: 'User authenticated successfully'
      })

    } catch (error) {
      console.error('User fetch error:', error)
      return NextResponse.json(
        {
          error: 'Internal server error',
          user: mockUser,
          configured: false
        },
        { status: 500 }
      )
    }
}