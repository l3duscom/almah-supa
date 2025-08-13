import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Get user ID from subscription metadata or customer
        let userId = subscription.metadata.supabase_user_id
        
        if (!userId) {
          // Fallback: get user by customer ID
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()
          
          userId = user?.id
        }

        if (!userId) {
          console.error('No user found for subscription:', subscription.id)
          return NextResponse.json({ error: 'User not found' }, { status: 400 })
        }

        // Update user subscription status
        const isActive = subscription.status === 'active'
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        await supabase
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

        console.log(`Subscription ${subscription.status} for user ${userId}`)
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
        
        if (invoice.subscription) {
          // Get subscription to update user
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (user) {
            // Extend subscription period
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
            
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
        
        if (invoice.subscription) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription as string)
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
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}