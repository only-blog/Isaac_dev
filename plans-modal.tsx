"use client"

import { useState } from "react"
import { useCredits } from "@/hooks/use-credits"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentModal } from "@/components/payment-modal"
import { Check, Zap, Crown, Gift } from "lucide-react"
import { toast } from "sonner"
import type { UserPlan } from "@/lib/credits-system"

interface PlansModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlansModal({ open, onOpenChange }: PlansModalProps) {
  const { plans, getCurrentPlan, upgradePlan } = useCredits()
  const [loading, setLoading] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null)
  const currentPlan = getCurrentPlan()

  const handleSelectPlan = async (plan: UserPlan) => {
    if (plan.id === "free") return

    if (plan.price === 0) {
      // Plano gratuito - upgrade direto
      setLoading(plan.id)
      try {
        const success = await upgradePlan(plan.id)
        if (success) {
          toast.success("Plano atualizado com sucesso!")
          onOpenChange(false)
        } else {
          toast.error("Erro ao atualizar plano. Tente novamente.")
        }
      } catch (error) {
        toast.error("Erro ao processar upgrade.")
      } finally {
        setLoading(null)
      }
    } else {
      // Plano pago - abrir modal de pagamento
      setSelectedPlan(plan)
      setShowPaymentModal(true)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Gift className="h-6 w-6" />
      case "flash":
        return <Zap className="h-6 w-6" />
      case "pro":
        return <Crown className="h-6 w-6" />
      default:
        return <Gift className="h-6 w-6" />
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Escolha seu Plano</DialogTitle>
            <p className="text-center text-gray-600">Desbloqueie todo o potencial do Isaac Muaco Dev Assistant</p>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan.id === plan.id
              const isUpgrade = plan.price > currentPlan.price

              return (
                <Card
                  key={plan.id}
                  className={`relative p-6 transition-all duration-300 hover:shadow-lg ${
                    isCurrentPlan
                      ? "border-2 border-teal-500 bg-teal-50"
                      : plan.id === "pro"
                        ? "border-2 border-purple-200 bg-gradient-to-b from-purple-50 to-white"
                        : "border border-gray-200"
                  }`}
                >
                  {plan.id === "pro" && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                      Mais Popular
                    </Badge>
                  )}

                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white">
                      Plano Atual
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex p-3 rounded-full mb-4 ${
                        plan.color === "purple"
                          ? "bg-purple-100 text-purple-600"
                          : plan.color === "blue"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price === 0 ? "Grátis" : `$${plan.price}`}</span>
                      {plan.price > 0 && <span className="text-gray-600">/mês</span>}
                    </div>
                    <p className="text-sm text-gray-600">{plan.credits} mensagens por mês</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : plan.id === "pro" ? "default" : "outline"}
                    disabled={isCurrentPlan || loading === plan.id}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processando...
                      </div>
                    ) : isCurrentPlan ? (
                      "Plano Atual"
                    ) : plan.id === "free" ? (
                      "Gratuito"
                    ) : (
                      `Escolher ${plan.name}`
                    )}
                  </Button>
                </Card>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>Dica:</strong> Convide amigos e ganhe créditos extras! Cada amigo convidado te dá 5 créditos
              bônus.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} selectedPlan={selectedPlan} />
    </>
  )
}
