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

export async function GET() {
  try {
    // For development/demo purposes, return mock user data
    // In production with proper Supabase config, this should use real authentication

    return NextResponse.json({
      user: mockUser,
      configured: true,
      message: 'Using mock user data - configure Supabase for production'
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