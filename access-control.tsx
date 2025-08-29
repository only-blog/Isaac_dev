"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "@/components/auth-modal"
import { PlansModal } from "@/components/plans-modal"
import { Lock, Crown, Zap } from "lucide-react"
import { useState } from "react"

interface AccessControlProps {
  children: React.ReactNode
  requiredPlan?: "free" | "flash" | "pro"
  fallback?: React.ReactNode
}

export function AccessControl({ children, requiredPlan = "free", fallback }: AccessControlProps) {
  const { user } = useAuth()
  const { getCurrentPlan } = useCredits()
  const [showPlansModal, setShowPlansModal] = useState(false)

  const currentPlan = getCurrentPlan()
  const planHierarchy = { free: 0, flash: 1, pro: 2 }

  // Se não está logado
  if (!user) {
    return (
      fallback || (
        <Card className="p-6 text-center">
          <div className="mb-4">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground mb-4">Faça login para acessar este recurso</p>
          <AuthModal>
            <Button>Fazer Login</Button>
          </AuthModal>
        </Card>
      )
    )
  }

  // Se o plano atual não atende ao requisito
  if (planHierarchy[currentPlan.id as keyof typeof planHierarchy] < planHierarchy[requiredPlan]) {
    const requiredPlanName = requiredPlan === "flash" ? "Flash" : "Pro"
    const requiredPlanIcon = requiredPlan === "flash" ? <Zap className="w-6 h-6" /> : <Crown className="w-6 h-6" />

    return (
      fallback || (
        <Card className="p-6 text-center">
          <div className="mb-4 text-accent">{requiredPlanIcon}</div>
          <h3 className="text-lg font-semibold mb-2">Upgrade Necessário</h3>
          <p className="text-muted-foreground mb-4">
            Este recurso requer o plano <Badge variant="outline">{requiredPlanName}</Badge>
          </p>
          <Button onClick={() => setShowPlansModal(true)}>Fazer Upgrade</Button>
          <PlansModal open={showPlansModal} onOpenChange={setShowPlansModal} />
        </Card>
      )
    )
  }

  // Se tem acesso, renderiza o conteúdo
  return <>{children}</>
}
