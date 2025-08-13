'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [isInitialized, setIsInitialized] = useState(false)
  const checkoutElementRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(false)

  // Cleanup function
  const cleanupCheckout = useCallback(() => {
    if (checkout) {
      try {
        checkout.destroy()
      } catch (err) {
        console.warn('Error destroying checkout:', err)
      }
      setCheckout(null)
    }
    
    // Clear the DOM element using ref
    if (checkoutElementRef.current) {
      checkoutElementRef.current.innerHTML = ''
    }
    
    isMountedRef.current = false
    setIsInitialized(false)
    setError(null)
    setLoading(false)
  }, [checkout])

  useEffect(() => {
    if (!isOpen || !plan) {
      cleanupCheckout()
      return
    }

    // Prevent multiple initializations
    if (isInitialized) {
      return
    }

    const initializeCheckout = async () => {
      // Mark as initializing to prevent concurrent calls
      setIsInitialized(true)
      setLoading(true)
      setError(null)
      
      if (!window.Stripe) {
        setError('Stripe não foi carregado. Recarregue a página.')
        setLoading(false)
        setIsInitialized(false)
        return
      }

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        setError('Chave pública do Stripe não configurada.')
        setLoading(false)
        setIsInitialized(false)
        return
      }

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

        if (!response.ok) {
          setError(`Erro na API: ${response.status}`)
          setLoading(false)
          setIsInitialized(false)
          return
        }

        const result = await response.json()
        const { clientSecret, error: apiError } = result

        if (apiError) {
          setError(apiError)
          setLoading(false)
          setIsInitialized(false)
          return
        }

        if (!clientSecret) {
          setError('Client secret não recebido da API')
          setLoading(false)
          setIsInitialized(false)
          return
        }

        // Initialize Stripe embedded checkout
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        
        if (!publishableKey) {
          throw new Error('Chave pública do Stripe não configurada')
        }
        
        const stripe = window.Stripe(publishableKey)
        
        if (!stripe) {
          throw new Error('Falha ao inicializar Stripe')
        }
        
        const embeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret: clientSecret,
        })

        setCheckout(embeddedCheckout)

        // Wait a bit for the DOM to be ready and check if element exists before mounting
        setTimeout(() => {
          if (checkoutElementRef.current && isOpen && !isMountedRef.current) {
            // Clear any existing content
            checkoutElementRef.current.innerHTML = ''
            
            // Add a unique ID to the element for Stripe to mount on
            const elementId = 'embedded-checkout-' + Date.now()
            checkoutElementRef.current.id = elementId
            
            try {
              embeddedCheckout.mount('#' + elementId)
              isMountedRef.current = true
            } catch (mountError) {
              console.warn('Failed to mount checkout:', mountError)
              setError('Erro ao carregar checkout. Tente novamente.')
              setLoading(false)
              setIsInitialized(false)
            }
          } else if (!isOpen) {
            // Modal was closed before mounting, clean up
            try {
              embeddedCheckout.destroy()
            } catch (destroyError) {
              console.warn('Error destroying unmounted checkout:', destroyError)
            }
            setIsInitialized(false)
          }
        }, 100)

      } catch (err) {
        console.error('Checkout initialization error:', err)
        setError(`Erro: ${(err as Error).message || 'Erro desconhecido'}`)
        setLoading(false)
        setIsInitialized(false)
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()

    // Cleanup on unmount
    return cleanupCheckout
  }, [isOpen, plan, isInitialized, cleanupCheckout])

  const handleClose = () => {
    cleanupCheckout()
    onClose()
  }

  if (!plan) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing via the X button, not by clicking outside
      if (!open && !loading) {
        handleClose()
      }
    }}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => !loading && handleClose()}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Assinar {plan.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="ml-2">Carregando checkout...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
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
          <div ref={checkoutElementRef} className="min-h-[500px] w-full"></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}