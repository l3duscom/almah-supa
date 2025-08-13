'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface StripeCheckoutButtonProps {
  priceId: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export default function StripeCheckoutButton({ 
  priceId, 
  children, 
  className,
  disabled = false 
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (disabled) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        console.error('Checkout error:', error)
        alert('Erro ao processar pagamento. Tente novamente.')
        return
      }

      // Redirect to Stripe Checkout
      const stripe = (window as unknown as { Stripe: (key: string) => { redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: Error }> } }).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      })

      if (stripeError) {
        console.error('Stripe redirect error:', stripeError)
        alert('Erro ao redirecionar para pagamento. Tente novamente.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Processando...
        </>
      ) : (
        children
      )}
    </Button>
  )
}

// Export the main component for direct use with any price ID
export { StripeCheckoutButton }