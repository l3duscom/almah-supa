'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Crown, X, Sparkles, Users, Mail, Zap, Timer, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface UpgradeBannerProps {
  groupCount?: number
  plan: 'free' | 'premium'
}

export default function UpgradeBanner({ groupCount = 0, plan }: UpgradeBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showPulse, setShowPulse] = useState(false)

  // Don't show for premium users
  if (plan === 'premium' || !isVisible) {
    return null
  }

  const groupsRemaining = Math.max(0, 3 - groupCount)
  const isNearLimit = groupCount >= 2
  const isAtLimit = groupCount >= 3

  // Create urgency with pulse animation
  useEffect(() => {
    if (isNearLimit) {
      const interval = setInterval(() => {
        setShowPulse(prev => !prev)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isNearLimit])
  
  // Get message based on user status
  const getMessage = () => {
    if (isAtLimit) {
      return {
        title: '🚨 Limite atingido!',
        subtitle: 'Você não pode criar mais grupos no plano gratuito',
        urgency: 'high'
      }
    }
    if (isNearLimit) {
      return {
        title: '⚠️ Cuidado!',
        subtitle: `Resta apenas ${groupsRemaining} grupo${groupsRemaining !== 1 ? 's' : ''} no seu plano`,
        urgency: 'medium'
      }
    }
    return {
      title: '✨ Desbloqueie seu potencial',
      subtitle: 'Upgrade para Premium e tenha recursos ilimitados',
      urgency: 'low'
    }
  }

  const message = getMessage()
  
  return (
    <div className={`relative overflow-hidden text-white transition-all duration-500 ${
      message.urgency === 'high' 
        ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800' 
        : message.urgency === 'medium'
        ? 'bg-gradient-to-r from-cyan-500 via-teal-600 to-purple-700'
        : 'bg-gradient-to-r from-cyan-400 via-teal-500 to-blue-600'
    } ${showPulse && isNearLimit ? 'animate-pulse' : ''}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-10 animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute top-8 right-20 animate-bounce delay-100">
          <Crown className="w-5 h-5" />
        </div>
        <div className="absolute bottom-4 left-1/4 animate-pulse delay-200">
          <Zap className="w-3 h-3" />
        </div>
        <div className="absolute bottom-6 right-1/3 animate-bounce delay-300">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Message and features in one line */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-white" />
              <span className="font-bold text-sm">
                {message.title}
              </span>
              <span className="text-xs text-white/80 hidden sm:inline">
                {message.subtitle}
              </span>
            </div>

            {/* Inline features for desktop */}
            <div className="hidden lg:flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Grupos ∞
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Premium
              </span>
            </div>

            {/* Usage indicator inline */}
            {!isAtLimit && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span>Uso:</span>
                <div className="bg-white/30 rounded-full h-1.5 w-16">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      groupCount >= 2 ? 'bg-red-400' : 'bg-white/60'
                    }`}
                    style={{ width: `${(groupCount / 3) * 100}%` }}
                  />
                </div>
                <span>{groupCount}/3</span>
              </div>
            )}
          </div>

          {/* Right side - Price and CTA */}
          <div className="flex items-center gap-3">
            {/* Inline price */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-white/70 line-through">R$ 29</span>
              <span className="font-bold">R$ 19/mês</span>
              {message.urgency === 'high' && (
                <span className="animate-pulse text-yellow-300">Oferta limitada!</span>
              )}
            </div>

            {/* Compact CTA */}
            <Button 
              asChild 
              size="sm"
              className={`font-bold px-3 py-1 text-xs transition-all duration-300 transform hover:scale-105 ${
                message.urgency === 'high'
                  ? 'bg-white text-purple-600 hover:bg-gray-100'
                  : 'bg-white text-teal-600 hover:bg-gray-100'
              }`}
            >
              <Link href="/app/planos">
                <Crown className="w-3 h-3 mr-1" />
                {isAtLimit ? 'Desbloqueie!' : isNearLimit ? 'Upgrade!' : 'Premium'}
              </Link>
            </Button>

            {/* Compact close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
              aria-label="Fechar banner"
            >
              <X className="w-3 h-3 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle shadow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-b from-transparent to-black/10"></div>
    </div>
  )
}