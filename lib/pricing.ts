import { createClient } from '@/utils/supabase/server'
import { formatPrice, getBillingPeriodLabel, calculateMonthlyEquivalent } from '@/lib/pricing-client'
import type { PricingPlan } from '@/lib/pricing-client'

// Re-export client utilities for server-side use
export type { PricingPlan }
export { formatPrice, getBillingPeriodLabel, calculateMonthlyEquivalent }

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching pricing plans:', error)
    return []
  }

  return data || []
}

export async function getPricingPlanByStripeId(stripePriceId: string): Promise<PricingPlan | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('stripe_price_id', stripePriceId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching pricing plan by Stripe ID:', error)
    return null
  }

  return data
}

