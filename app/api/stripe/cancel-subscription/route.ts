import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user's subscription info
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userProfile.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(
      userProfile.stripe_subscription_id
    )

    console.log('Subscription canceled:', canceledSubscription.id)

    // Update user in database (webhook will also handle this, but we do it here for immediate UI update)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        plan: 'free',
        stripe_subscription_id: null,
        plan_started_at: null,
        plan_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user after cancellation:', updateError)
      // Don't return error here as the Stripe cancellation succeeded
    }

    return NextResponse.json({ 
      success: true,
      message: 'Assinatura cancelada com sucesso'
    })

  } catch (error: unknown) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    )
  }
}