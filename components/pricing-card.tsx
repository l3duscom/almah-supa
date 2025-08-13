'use client'

import { Check, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StripeCheckoutButton from '@/components/stripe-checkout-button'
import { PricingPlan, formatPrice, getBillingPeriodLabel, calculateMonthlyEquivalent } from '@/lib/pricing'

interface PricingCardProps {
  plan: PricingPlan
  isRecommended?: boolean
  isCurrentPlan?: boolean
  disabled?: boolean
}

export function PricingCard({ 
  plan, 
  isRecommended = false, 
  isCurrentPlan = false,
  disabled = false
}: PricingCardProps) {
  const monthlyEquivalent = calculateMonthlyEquivalent(plan.price_cents, plan.billing_period)
  const isAnnual = plan.billing_period === 'annual'
  
  return (
    <div className={`
      bg-gray-800 p-6 rounded-lg border-2 relative
      ${isRecommended ? 'border-yellow-400' : 'border-gray-700'}
    `}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">
            Melhor Valor
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
        
        <div className="mt-2">
          <div className="text-3xl font-bold text-yellow-400">
            {formatPrice(plan.price_cents)}
          </div>
          <div className="text-sm text-gray-400">
            /{getBillingPeriodLabel(plan.billing_period).toLowerCase()}
          </div>
          
          {plan.billing_period !== 'monthly' && (
            <div className="text-xs text-gray-500 mt-1">
              Equivale a {formatPrice(monthlyEquivalent)}/mês
            </div>
          )}
        </div>

        {plan.description && (
          <p className="text-gray-400 mt-2">{plan.description}</p>
        )}

        {/* Discount badge for longer plans */}
        {isAnnual && (
          <Badge variant="secondary" className="mt-2 bg-green-600 text-white">
            2 meses grátis
          </Badge>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <Button 
          className="w-full bg-yellow-400 text-black"
          disabled
        >
          Plano Atual
        </Button>
      ) : (
        <StripeCheckoutButton 
          priceId={plan.stripe_price_id}
          className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
          disabled={disabled}
        >
          <Crown className="w-4 h-4 mr-2" />
          Assinar {plan.name}
        </StripeCheckoutButton>
      )}
    </div>
  )
}