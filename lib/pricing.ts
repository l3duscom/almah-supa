import { createClient } from '@/utils/supabase/server'

export interface PricingPlan {
  id: string
  name: string
  description: string | null
  stripe_price_id: string
  stripe_product_id: string
  billing_period: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
  price_cents: number
  currency: string
  is_active: boolean
  sort_order: number
  features: string[]
  created_at: string
  updated_at: string
}

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

export function formatPrice(priceCents: number, currency: string = 'brl'): string {
  const price = priceCents / 100
  
  if (currency.toLowerCase() === 'brl') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(price)
}

export function getBillingPeriodLabel(period: string): string {
  const labels = {
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    semiannual: 'Semestral',
    annual: 'Anual'
  }
  
  return labels[period as keyof typeof labels] || period
}

export function calculateMonthlyEquivalent(priceCents: number, billingPeriod: string): number {
  const monthsMap = {
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    annual: 12
  }
  
  const months = monthsMap[billingPeriod as keyof typeof monthsMap] || 1
  return Math.round(priceCents / months)
}