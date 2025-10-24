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

    // Try to get real user data
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Get user error:', error)
      return NextResponse.json(
        {
          error: error.message,
          user: null,
          configured: true
        },
        { status: 401 }
      )
    }

    // Return user data
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
        configured: false,
      },
      { status: 500 }
      )
    }
}