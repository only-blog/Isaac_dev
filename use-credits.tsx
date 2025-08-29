"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { CreditsSystem, type UserCredits, PLANS } from "@/lib/credits-system"

export function useCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCredits = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Inicializar créditos se necessário
      await CreditsSystem.initializeUserCredits(user.uid)
      // Carregar créditos
      const userCredits = await CreditsSystem.getUserCredits(user.uid)
      setCredits(userCredits)
    } catch (error) {
      console.error("Erro ao carregar créditos:", error)
    } finally {
      setLoading(false)
    }
  }

  const canUseChat = async (): Promise<{ canUse: boolean; reason?: string }> => {
    if (!user) return { canUse: false, reason: "Usuário não logado" }
    return await CreditsSystem.canUseChat(user.uid)
  }

  const upgradePlan = async (planId: string): Promise<boolean> => {
    if (!user) return false

    const success = await CreditsSystem.upgradePlan(user.uid, planId)
    if (success) {
      await loadCredits() // Recarregar créditos
    }
    return success
  }

  const getCurrentPlan = () => {
    if (!credits) return PLANS[0] // Plano gratuito
    return PLANS.find((p) => p.id === credits.plan) || PLANS[0]
  }

  const getDaysUntilExpiry = () => {
    if (!credits) return 0
    const now = new Date()
    const expiry = credits.planExpiry
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  useEffect(() => {
    if (user) {
      loadCredits()
    } else {
      setCredits(null)
      setLoading(false)
    }
  }, [user])

  return {
    credits,
    loading,
    canUseChat,
    upgradePlan,
    getCurrentPlan,
    getDaysUntilExpiry,
    refreshCredits: loadCredits,
    plans: PLANS,
  }
}
