'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'
import { PricingPlan } from '@/lib/pricing-client'

interface StripeEmbeddedCheckoutProps {
  plan: PricingPlan | null
  isOpen: boolean
  onClose: () => void
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => {
      initEmbeddedCheckout: (options: { clientSecret: string }) => Promise<{
        mount: (selector: string) => void
        destroy: () => void
      }>
    }
  }
}

export function StripeEmbeddedCheckout({ plan, isOpen, onClose }: StripeEmbeddedCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [checkout, setCheckout] = useState<{ mount: (selector: string) => void; destroy: () => void } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !plan) {
      // Clean up checkout when modal closes
      if (checkout) {
        checkout.destroy()
        setCheckout(null)
      }
      return
    }

    const initializeCheckout = async () => {
      if (!window.Stripe) {
        setError('Stripe não foi carregado. Recarregue a página.')
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Create checkout session
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: plan.stripe_price_id,
          }),
        })

        const { clientSecret, error: apiError } = await response.json()

        if (apiError) {
          setError(apiError)
          return
        }

        // Initialize Stripe embedded checkout
        const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        const embeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret: clientSecret,
        })

        setCheckout(embeddedCheckout)

        // Mount checkout to the DOM
        embeddedCheckout.mount('#embedded-checkout')

      } catch (err) {
        console.error('Checkout initialization error:', err)
        setError('Erro ao inicializar checkout. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()

    return () => {
      if (checkout) {
        checkout.destroy()
      }
    }
  }, [isOpen, plan, checkout])

  const handleClose = () => {
    if (checkout) {
      checkout.destroy()
      setCheckout(null)
    }
    onClose()
  }

  if (!plan) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Assinar {plan.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="ml-2">Carregando checkout...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm" 
                className="ml-2"
              >
                Recarregar
              </Button>
            </div>
          )}

          {/* Stripe embedded checkout will be mounted here */}
          <div id="embedded-checkout" className="min-h-[400px]"></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}