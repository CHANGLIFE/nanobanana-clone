import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: 'Supabase authentication is not configured. Please set up your Supabase project first.',
          needsConfiguration: true
        },
        { status: 400 }
      )
    }

    const { provider, next } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'github' | 'google',
      options: {
        redirectTo: `${request.nextUrl.origin}/api/auth/callback?next=${next || '/'}`,
      },
    })

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      url: data.url
    })
  } catch (error: any) {
    console.error('Login error:', error)

    // Handle Supabase configuration errors gracefully
    if (error.message?.includes('Supabase not configured')) {
      return NextResponse.json(
        {
          error: error.message,
          needsConfiguration: true
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}