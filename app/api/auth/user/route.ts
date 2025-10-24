import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        user: null,
        configured: false,
        message: 'Supabase authentication is not configured'
      })
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Get user error:', error)
      return NextResponse.json(
        { error: error.message, user: null, configured: true },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: user,
      configured: true
    })
  } catch (error: any) {
    console.error('User fetch error:', error)

    // Handle Supabase configuration errors gracefully
    if (error.message?.includes('Supabase not configured')) {
      return NextResponse.json({
        user: null,
        configured: false,
        message: error.message
      })
    }

    return NextResponse.json(
      { error: 'Internal server error', user: null },
      { status: 500 }
    )
  }
}