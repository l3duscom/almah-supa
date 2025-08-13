'use client'

import { useEffect, useState } from 'react'
// Client-side plan features
const getPlanFeatures = (plan: string) => {
  if (plan === 'free') {
    return [
      'Até 3 grupos',
      'Até 20 participantes por grupo',
      'Sorteio básico',
      'Suporte por email'
    ]
  }
  return [
    'Grupos ilimitados',
    'Participantes ilimitados', 
    'Histórico completo',
    'Suporte prioritário',
    'Temas personalizados'
  ]
}
import { createClient } from '@/utils/supabase/client'
import { PricingPlan } from '@/lib/pricing-client'
import { Button } from '@/components/ui/button'
import { Crown, Users } from 'lucide-react'
import { StripeEmbeddedCheckout } from '@/components/stripe-embedded-checkout'
import { CancelSubscriptionModal } from '@/components/cancel-subscription-modal'
import { ChangePlanModal } from '@/components/change-plan-modal'
import Script from 'next/script'

interface Subscription {
  plan: string
  plan_expires_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export default function PlanosPage() {
  // const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false)
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'monthly' | 'semiannual' | 'annual'>('annual')
  const [currentUserPlan, setCurrentUserPlan] = useState<PricingPlan | null>(null)
  const [planToChangeTo, setPlanToChangeTo] = useState<PricingPlan | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/login'
          return
        }
        // setUser(user)

        // Get user subscription
        const { data: userProfile } = await supabase
          .from('users')
          .select('plan, plan_expires_at, stripe_customer_id, stripe_subscription_id, current_price_id')
          .eq('id', user.id)
          .single()
        
        setSubscription(userProfile)

        // Get pricing plans
        const { data: plans } = await supabase
          .from('pricing_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        
        setPricingPlans(plans || [])

        // Find current user's plan details
        if (userProfile?.current_price_id && plans) {
          const currentPlan = plans.find(p => p.stripe_price_id === userProfile.current_price_id)
          setCurrentUserPlan(currentPlan || null)
        }

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubscribe = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setIsCheckoutOpen(true)
  }

  const handleUpgrade = () => {
    const selectedPeriodPlan = pricingPlans.find(p => p.billing_period === selectedBillingPeriod)
    if (selectedPeriodPlan) {
      handleSubscribe(selectedPeriodPlan)
    }
  }

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false)
    setSelectedPlan(null)
  }

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura')
      }

      // Refresh the page data to show updated subscription status
      window.location.reload()

    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Erro ao cancelar assinatura. Tente novamente.')
    }
  }

  const handleChangePlan = (newPlan: PricingPlan) => {
    setPlanToChangeTo(newPlan)
    setIsChangePlanModalOpen(true)
  }

  const handleConfirmPlanChange = async (newPriceId: string) => {
    try {
      const response = await fetch('/api/stripe/change-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPriceId: newPriceId,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao alterar plano')
      }

      // Refresh the page data to show updated subscription
      window.location.reload()

    } catch (error) {
      console.error('Error changing plan:', error)
      alert('Erro ao alterar plano. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'
  const isActive = subscription?.plan_expires_at 
    ? new Date(subscription.plan_expires_at) > new Date()
    : true

  const freeFeatures = getPlanFeatures('free')
  const premiumFeatures = getPlanFeatures('premium')

  // Get pricing for selected period
  const selectedPeriodPlan = pricingPlans.find(p => p.billing_period === selectedBillingPeriod)
  const monthlyPlan = pricingPlans.find(p => p.billing_period === 'monthly')
  const semiannualPlan = pricingPlans.find(p => p.billing_period === 'semiannual')
  const annualPlan = pricingPlans.find(p => p.billing_period === 'annual')

  // Calculate savings
  const calculateSavings = (plan: PricingPlan | undefined) => {
    if (!plan || !monthlyPlan) return null
    const monthlyTotal = monthlyPlan.price_cents * (plan.billing_period === 'semiannual' ? 6 : 12)
    const savings = monthlyTotal - plan.price_cents
    const percentage = Math.round((savings / monthlyTotal) * 100)
    return { amount: savings, percentage }
  }

  return (
    <>
      <Script src="https://js.stripe.com/v3/" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Comece grátis ou desbloqueie todos os recursos com o Premium
          </p>
          
          {/* Current Plan Badge */}
          {currentPlan === 'premium' && isActive && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full mb-8">
              <Crown className="w-4 h-4" />
              <span>Você está no plano Premium</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-yellow-400 hover:text-yellow-300 ml-2"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          
          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-800 p-1 rounded-lg flex">
              <button
                onClick={() => setSelectedBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedBillingPeriod === 'monthly'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setSelectedBillingPeriod('semiannual')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  selectedBillingPeriod === 'semiannual'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Semestral
                {semiannualPlan && (
                  <span className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    -{calculateSavings(semiannualPlan)?.percentage}%
                  </span>
                )}
              </button>
              <button
                onClick={() => setSelectedBillingPeriod('annual')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  selectedBillingPeriod === 'annual'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Anual
                {annualPlan && (
                  <span className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    -{calculateSavings(annualPlan)?.percentage}%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-8">
              <div className="text-center mb-8">
                <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Gratuito</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  R$ 0
                  <span className="text-lg text-gray-400 font-normal">/mês</span>
                </div>
                <p className="text-gray-400">Perfeito para começar</p>
              </div>

              <ul className="space-y-4 mb-8">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-900/50 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 text-sm">✓</span>
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline" 
                className="w-full h-12 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                disabled={currentPlan === 'free'}
              >
                {currentPlan === 'free' ? 'Seu plano atual' : 'Plano gratuito'}
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-2xl border-2 border-yellow-500 p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                
                {selectedPeriodPlan && (
                  <>
                    <div className="text-4xl font-bold text-white mb-2">
                      R$ {Math.floor(selectedPeriodPlan.price_cents / 100)}
                      <span className="text-lg text-gray-400 font-normal">
                        /{selectedBillingPeriod === 'monthly' ? 'mês' : 
                          selectedBillingPeriod === 'semiannual' ? '6 meses' : 'ano'}
                      </span>
                    </div>
                    
                    {selectedBillingPeriod !== 'monthly' && monthlyPlan && (
                      <p className="text-gray-400 text-sm">
                        Equivale a R$ {Math.floor(selectedPeriodPlan.price_cents / 100 / (selectedBillingPeriod === 'semiannual' ? 6 : 12))}/mês
                      </p>
                    )}
                  </>
                )}
                
                <p className="text-gray-400 mt-2">Para uso profissional</p>
              </div>

              <ul className="space-y-4 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-yellow-900/50 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 text-sm">✓</span>
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentPlan === 'premium' && isActive ? (
                <div className="space-y-3">
                  {/* Current plan indicator */}
                  {currentUserPlan && selectedPeriodPlan && currentUserPlan.stripe_price_id === selectedPeriodPlan.stripe_price_id ? (
                    <Button className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-900" disabled>
                      Seu plano atual
                    </Button>
                  ) : selectedPeriodPlan ? (
                    <Button 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleChangePlan(selectedPeriodPlan)}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Alterar para {selectedBillingPeriod === 'monthly' ? 'Mensal' : selectedBillingPeriod === 'semiannual' ? 'Semestral' : 'Anual'}
                    </Button>
                  ) : null}
                  
                  {/* Current plan info */}
                  {currentUserPlan && (
                    <p className="text-xs text-gray-400 text-center">
                      Plano atual: Premium {currentUserPlan.billing_period === 'monthly' ? 'Mensal' : 
                        currentUserPlan.billing_period === 'semiannual' ? 'Semestral' : 'Anual'} 
                      (R$ {(currentUserPlan.price_cents / 100).toFixed(2)})
                    </p>
                  )}
                </div>
              ) : (
                <Button 
                  className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                  onClick={handleUpgrade}
                  disabled={!selectedPeriodPlan}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Fazer upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-300">
                Sim! Você pode cancelar sua assinatura Premium a qualquer momento. 
                Você continuará tendo acesso aos recursos Premium até o final do período pago.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                O que acontece com meus grupos no plano gratuito?
              </h3>
              <p className="text-gray-300">
                Se você fizer downgrade para o plano gratuito, seus grupos existentes 
                permanecerão ativos, mas você só poderá criar novos grupos dentro do limite gratuito.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                Como funciona o pagamento?
              </h3>
              <p className="text-gray-300">
                O pagamento é processado de forma segura através do Stripe. 
                Os planos semestral e anual são cobrados uma única vez no período.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                Preciso de ajuda?
              </h3>
              <p className="text-gray-300">
                Entre em contato conosco através do email suporte@amigsosecreto.com 
                ou pelo chat no site. Usuários Premium têm suporte prioritário!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Embedded Checkout Modal */}
      <StripeEmbeddedCheckout 
        plan={selectedPlan}
        isOpen={isCheckoutOpen}
        onClose={handleCheckoutClose}
      />

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelSubscription}
      />

      {/* Change Plan Modal */}
      <ChangePlanModal 
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        onConfirm={handleConfirmPlanChange}
        currentPlan={currentUserPlan}
        newPlan={planToChangeTo}
      />
    </>
  )
}