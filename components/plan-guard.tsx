import { ReactNode } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getUserLimits, getUserGroupCount } from '@/lib/subscription'
import { Button } from '@/components/ui/button'
import { Crown, Lock } from 'lucide-react'
import Link from 'next/link'

interface PlanGuardProps {
  children: ReactNode
  feature: 'create_group' | 'unlimited_participants'
  fallback?: ReactNode
}

export default async function PlanGuard({ children, feature, fallback }: PlanGuardProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Não autorizado</div>
  }

  const limits = await getUserLimits(user.id)
  
  if (!limits) {
    return <div>Erro ao carregar limites</div>
  }

  // Check specific feature limits
  let canAccess = true
  let limitMessage = ''

  if (feature === 'create_group') {
    if (limits.max_groups !== -1) {
      const groupCount = await getUserGroupCount(user.id)
      canAccess = groupCount < limits.max_groups
      limitMessage = `Você atingiu o limite de ${limits.max_groups} grupos do plano gratuito.`
    }
  }

  if (feature === 'unlimited_participants') {
    canAccess = limits.max_participants_per_group === -1
    limitMessage = `Plano gratuito limitado a ${limits.max_participants_per_group} participantes por grupo.`
  }

  if (canAccess) {
    return <>{children}</>
  }

  // Show fallback or default upgrade message
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border-2 border-yellow-400/50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-yellow-400/10 rounded-full">
            <Lock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          Recurso Premium
        </h3>
        
        <p className="text-gray-400 mb-6">
          {limitMessage}
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
            <Link href="/app/planos">
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade para Premium
            </Link>
          </Button>
          
          <p className="text-sm text-gray-500">
            Premium: Grupos e participantes ilimitados
          </p>
        </div>
      </div>
    </div>
  )
}