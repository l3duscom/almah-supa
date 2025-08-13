'use client'

import { useEffect, useState } from 'react'
import { requireAuth } from '@/lib/auth'
import { getUserSubscription, getPlanDisplayName, getPlanFeatures } from '@/lib/subscription'
import { createClient } from '@/utils/supabase/client'
import { PricingPlan } from '@/lib/pricing-client'
import { Button } from '@/components/ui/button'
import { Crown, Users } from 'lucide-react'
import { PricingCard } from '@/components/pricing-card'
import { StripeEmbeddedCheckout } from '@/components/stripe-embedded-checkout'
import Link from 'next/link'
import Script from 'next/script'

export default function PlanosPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [groupCount, setGroupCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

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
        setUser(user)

        // Get user subscription
        const { data: userProfile } = await supabase
          .from('users')
          .select('plan, plan_expires_at, stripe_customer_id, stripe_subscription_id')
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

        // Get current user's group count
        const { count } = await supabase
          .from('groups')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
        
        setGroupCount(count || 0)

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

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false)
    setSelectedPlan(null)
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

  // Group plans by billing period for better display
  const monthlyPlans = pricingPlans.filter(p => p.billing_period === 'monthly')
  const quarterlyPlans = pricingPlans.filter(p => p.billing_period === 'quarterly')
  const semiannualPlans = pricingPlans.filter(p => p.billing_period === 'semiannual')
  const annualPlans = pricingPlans.filter(p => p.billing_period === 'annual')

  return (
    <>
      <Script src="https://js.stripe.com/v3/" />
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Planos e Assinatura
        </h1>
        <p className="text-gray-400">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Seu Plano Atual
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {currentPlan === 'premium' ? (
                <Crown className="w-5 h-5 text-yellow-400" />
              ) : (
                <Users className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-lg font-medium text-white">
                Plano {getPlanDisplayName(currentPlan)}
              </span>
              {!isActive && currentPlan === 'premium' && (
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                  Expirado
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {groupCount} grupo(s) criado(s) {currentPlan === 'free' && '• Limite: 3 grupos'}
            </p>
            {subscription?.plan_expires_at && (
              <p className="text-sm text-gray-400">
                {isActive ? 'Renova em' : 'Expirou em'}: {new Date(subscription.plan_expires_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          {currentPlan === 'free' && (
            <Button asChild>
              <Link href="#upgrade">Fazer Upgrade</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Free Plan */}
      <div id="upgrade" className="mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700 max-w-md mx-auto">
          <div className="text-center mb-6">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">Gratuito</h3>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              R$ 0<span className="text-sm text-gray-400">/mês</span>
            </p>
            <p className="text-gray-400 mt-2">Perfeito para começar</p>
          </div>

          <ul className="space-y-3 mb-6">
            {freeFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-4 h-4 text-green-400 flex-shrink-0">✓</span>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <Button 
            variant="outline" 
            className="w-full"
            disabled={currentPlan === 'free'}
          >
            {currentPlan === 'free' ? 'Plano Atual' : 'Downgrade para Gratuito'}
          </Button>
        </div>
      </div>

      {/* Premium Plans */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Planos Premium
        </h2>
        
        {/* Monthly Plans */}
        {monthlyPlans.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Mensal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {monthlyPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={currentPlan === 'premium' && isActive}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quarterly Plans */}
        {quarterlyPlans.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Trimestral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quarterlyPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={currentPlan === 'premium' && isActive}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Semiannual Plans */}
        {semiannualPlans.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Semestral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {semiannualPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isRecommended={true}
                  isCurrentPlan={currentPlan === 'premium' && isActive}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Annual Plans */}
        {annualPlans.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Anual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {annualPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isRecommended={true}
                  isCurrentPlan={currentPlan === 'premium' && isActive}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Perguntas Frequentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">
              Posso cancelar a qualquer momento?
            </h3>
            <p className="text-gray-300">
              Sim! Você pode cancelar sua assinatura Premium a qualquer momento. 
              Você continuará tendo acesso aos recursos Premium até o final do período pago.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">
              O que acontece com meus grupos no plano gratuito?
            </h3>
            <p className="text-gray-300">
              Se você fizer downgrade para o plano gratuito, seus grupos existentes 
              permanecerão ativos, mas você só poderá criar novos grupos dentro do limite gratuito.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">
              Como funciona o pagamento?
            </h3>
            <p className="text-gray-300">
              O pagamento é processado de forma segura através do Stripe. 
              Você será cobrado mensalmente no dia da assinatura.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
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
    </>
  )
}