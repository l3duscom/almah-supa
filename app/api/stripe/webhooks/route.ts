import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  console.log('Webhook received:', req.url)
  
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    console.log('Webhook event verified:', event.type, event.id)
  } catch (err: unknown) {
    console.error(`Webhook signature verification failed.`, (err as Error).message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Use service role client for webhooks (no cookies/auth needed)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    console.log('Processing webhook event:', event.type)
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        console.log('Processing subscription:', subscription.id, 'for customer:', customerId)
        
        // Get user ID from subscription metadata or customer
        let userId = subscription.metadata.supabase_user_id
        
        if (!userId) {
          console.log('No userId in metadata, looking up by customer ID')
          // Fallback: get user by customer ID
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()
          
          if (userError) {
            console.error('Error fetching user by customer ID:', userError)
          }
          
          userId = user?.id
        }

        if (!userId) {
          console.error('No user found for subscription:', subscription.id, 'customer:', customerId)
          return NextResponse.json({ error: 'User not found' }, { status: 400 })
        }
        
        console.log('Found userId:', userId)

        // Update user subscription status
        const isActive = subscription.status === 'active'
        const currentPeriodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000)

        console.log('Updating user subscription:', {
          userId,
          isActive,
          subscriptionId: subscription.id,
          customerId,
          currentPeriodEnd: currentPeriodEnd.toISOString()
        })

        const { error: updateError } = await supabase
          .from('users')
          .update({
            plan: isActive ? 'premium' : 'free',
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            plan_started_at: isActive ? new Date().toISOString() : null,
            plan_expires_at: isActive ? currentPeriodEnd.toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating user subscription:', updateError)
          return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
        }

        console.log(`Subscription ${subscription.status} for user ${userId} updated successfully`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Get user by subscription ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (user) {
          // Downgrade user to free plan
          await supabase
            .from('users')
            .update({
              plan: 'free',
              stripe_subscription_id: null,
              plan_started_at: null,
              plan_expires_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          console.log(`Subscription canceled for user ${user.id}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if ((invoice as unknown as { subscription: string }).subscription) {
          // Get subscription to update user
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as unknown as { subscription: string }).subscription
          )
          
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (user) {
            // Extend subscription period
            const currentPeriodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000)
            
            await supabase
              .from('users')
              .update({
                plan: 'premium',
                plan_expires_at: currentPeriodEnd.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)

            console.log(`Payment succeeded for user ${user.id}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if ((invoice as unknown as { subscription: string }).subscription) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_subscription_id', (invoice as unknown as { subscription: string }).subscription)
            .single()

          if (user) {
            console.log(`Payment failed for user ${user.id}`)
            // Optionally, you can send an email notification here
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}