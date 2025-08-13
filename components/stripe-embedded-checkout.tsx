'use client'

import { useState, useEffect, useRef } from 'react'
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

// Global variable to track if there's an active checkout
let activeCheckout: { destroy: () => void } | null = null

export function StripeEmbeddedCheckout({ plan, isOpen, onClose }: StripeEmbeddedCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const checkoutMountedRef = useRef(false)

  // Simple cleanup function without dependencies
  const cleanup = () => {
    if (activeCheckout) {
      try {
        activeCheckout.destroy()
      } catch (err) {
        console.warn('Error destroying checkout:', err)
      }
      activeCheckout = null
    }
    
    // Clear any checkout elements
    const elements = document.querySelectorAll('[id^="stripe-checkout-"]')
    elements.forEach(el => {
      el.innerHTML = ''
    })
    
    checkoutMountedRef.current = false
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    if (!isOpen || !plan) {
      cleanup()
      return cleanup
    }

    // Prevent multiple initializations
    if (checkoutMountedRef.current) {
      return
    }

    const initializeCheckout = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Destroy any existing checkout first
        cleanup()
        
        if (!window.Stripe) {
          throw new Error('Stripe não foi carregado')
        }

        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        if (!publishableKey) {
          throw new Error('Chave pública do Stripe não configurada')
        }

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

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`)
        }

        const result = await response.json()
        const { clientSecret, error: apiError } = result

        if (apiError) {
          throw new Error(apiError)
        }

        if (!clientSecret) {
          throw new Error('Client secret não recebido')
        }

        // Initialize Stripe and embedded checkout
        const stripe = window.Stripe(publishableKey)
        if (!stripe) {
          throw new Error('Falha ao inicializar Stripe')
        }

        const embeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret: clientSecret,
        })

        // Store reference globally
        activeCheckout = embeddedCheckout
        
        // Wait for DOM and mount
        setTimeout(() => {
          const element = document.getElementById('stripe-checkout-container')
          if (element && isOpen && !checkoutMountedRef.current) {
            element.innerHTML = ''
            embeddedCheckout.mount('#stripe-checkout-container')
            checkoutMountedRef.current = true
          }
        }, 50)

      } catch (err) {
        console.error('Checkout initialization error:', err)
        setError((err as Error).message || 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()

    return cleanup
  }, [isOpen, plan?.stripe_price_id]) // Only depend on simple values

  const handleClose = () => {
    cleanup()
    onClose()
  }

  if (!plan) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !loading) {
        handleClose()
      }
    }}>
      <DialogContent 
        className="w-full max-w-none max-h-[90vh] flex flex-col p-0 bg-white m-4"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => !loading && handleClose()}
      >
        <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Crown className="w-5 h-5 text-yellow-500" />
            Assinar {plan.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-white">
          {loading && (
            <div className="flex items-center justify-center h-64 bg-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              <span className="ml-2 text-gray-700">Carregando checkout...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-6 mb-4">
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
          <div id="stripe-checkout-container" className="min-h-[400px] w-full bg-white"></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}