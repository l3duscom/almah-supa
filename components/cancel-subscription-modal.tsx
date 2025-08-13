'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface CancelSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function CancelSubscriptionModal({ isOpen, onClose, onConfirm }: CancelSubscriptionModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error canceling subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Cancelar Assinatura Premium
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Tem certeza que deseja cancelar sua assinatura Premium?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">O que acontecerá:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Sua assinatura será cancelada imediatamente</li>
              <li>• Você voltará ao plano gratuito</li>
              <li>• Seus grupos existentes permanecerão ativos</li>
              <li>• Você poderá criar apenas 3 grupos novos</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            Você pode assinar o Premium novamente a qualquer momento.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Manter Premium
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Cancelando...
              </>
            ) : (
              'Sim, Cancelar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}