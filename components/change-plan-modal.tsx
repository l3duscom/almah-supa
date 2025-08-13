'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, AlertCircle } from 'lucide-react'
import { PricingPlan } from '@/lib/pricing-client'

interface ChangePlanModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newPriceId: string) => Promise<void>
  currentPlan: PricingPlan | null
  newPlan: PricingPlan | null
}

export function ChangePlanModal({ isOpen, onClose, onConfirm, currentPlan, newPlan }: ChangePlanModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!newPlan) return
    
    setLoading(true)
    try {
      await onConfirm(newPlan.stripe_price_id)
      onClose()
    } catch (error) {
      console.error('Error changing plan:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!currentPlan || !newPlan) return null

  const isUpgrade = newPlan.price_cents > currentPlan.price_cents
  const currentPrice = currentPlan.price_cents / 100
  const newPrice = newPlan.price_cents / 100
  const priceDiff = Math.abs(newPrice - currentPrice)

  const getBillingPeriodText = (period: string) => {
    switch (period) {
      case 'monthly': return 'mensal'
      case 'semiannual': return 'semestral'
      case 'annual': return 'anual'
      default: return period
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Crown className="w-5 h-5 text-yellow-400" />
            {isUpgrade ? 'Upgrade de Plano' : 'Alteração de Plano'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <h4 className="font-medium text-white mb-2">Mudança solicitada:</h4>
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">De:</span>
                <span className="text-white">
                  Premium {getBillingPeriodText(currentPlan.billing_period)} (R$ {currentPrice.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Para:</span>
                <span className="text-white">
                  Premium {getBillingPeriodText(newPlan.billing_period)} (R$ {newPrice.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <h4 className="font-medium mb-1">Como funciona a mudança:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• A mudança será aplicada imediatamente</li>
                  <li>• {isUpgrade ? 'Você será cobrado' : 'Receberá um crédito de'} R$ {priceDiff.toFixed(2)} proporcional</li>
                  <li>• O próximo ciclo seguirá a nova periodicidade</li>
                  <li>• Você pode alterar novamente a qualquer momento</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            Confirme a mudança para prosseguir. A alteração será processada pelo Stripe de forma segura.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Confirmar Mudança
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}