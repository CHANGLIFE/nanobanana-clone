import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, planName, userEmail, requirements } = await request.json()

    // Validate required fields
    if (!userId || !planId || !planName || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, planId, planName, userEmail'
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

    // Create enterprise inquiry record
    const { data: inquiry, error: inquiryError } = await supabase
      .from('enterprise_inquiries')
      .insert({
        user_id: userId,
        plan_id: planId,
        plan_name: planName,
        user_email: userEmail,
        requirements: requirements || 'Interested in Enterprise plan',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (inquiryError) {
      console.error('Enterprise inquiry creation error:', inquiryError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to submit enterprise inquiry',
          details: inquiryError.message
        },
        { status: 500 }
      )
    }

    // In a real implementation, you would:
    // 1. Send email notification to sales team
    // 2. Send confirmation email to user
    // 3. Create a task in CRM system
    // 4. Add to a mailing list for follow-up

    console.log('Enterprise inquiry submitted:', {
      userId,
      userEmail,
      inquiryId: inquiry.id,
      requirements
    })

    return NextResponse.json({
      success: true,
      message: 'Enterprise inquiry submitted successfully',
      inquiry,
      expectedResponse: 'Sales team will contact you within 24 hours'
    })

  } catch (error) {
    console.error('Enterprise inquiry server error:', error)
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
    message: 'Enterprise inquiry endpoint',
    status: 'active',
    description: 'This endpoint handles Enterprise plan inquiries and sales contacts'
  })
}