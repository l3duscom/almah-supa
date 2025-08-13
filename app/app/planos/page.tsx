import { requireAuth } from '@/lib/auth'
import { getUserSubscription, getPlanDisplayName, getPlanFeatures } from '@/lib/subscription'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Check, Crown, Users } from 'lucide-react'
import Link from 'next/link'
import { PremiumCheckoutButton } from '@/components/stripe-checkout-button'
import Script from 'next/script'

export default async function PlanosPage() {
  const user = await requireAuth()
  const subscription = await getUserSubscription(user.id)
  const supabase = await createClient()

  // Get current user's group count
  const { count: groupCount } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  const currentPlan = subscription?.plan || 'free'
  const isActive = subscription?.plan_expires_at 
    ? new Date(subscription.plan_expires_at) > new Date()
    : true

  const freeFeatures = getPlanFeatures('free')
  const premiumFeatures = getPlanFeatures('premium')

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

      {/* Plans Comparison */}
      <div id="upgrade" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700">
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
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
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

        {/* Premium Plan */}
        <div className="bg-gray-800 p-6 rounded-lg border-2 border-yellow-400 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">
              Recomendado
            </span>
          </div>

          <div className="text-center mb-6">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">Premium</h3>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              R$ 19<span className="text-sm text-gray-400">/mês</span>
            </p>
            <p className="text-gray-400 mt-2">Para usuários avançados</p>
          </div>

          <ul className="space-y-3 mb-6">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          {currentPlan === 'premium' && isActive ? (
            <Button 
              className="w-full bg-yellow-400 text-black"
              disabled
            >
              Plano Atual
            </Button>
          ) : (
            <PremiumCheckoutButton 
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade para Premium
            </PremiumCheckoutButton>
          )}
        </div>
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
    </>
  )
}