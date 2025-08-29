"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { UUIDSystem } from "@/lib/uuid-system"
import { toast } from "sonner"

export function InviteProcessor() {
  const { user } = useAuth()

  useEffect(() => {
    const processInvite = async () => {
      if (!user) return

      // Verificar se há código de convite na URL
      const urlParams = new URLSearchParams(window.location.search)
      const inviteCode = urlParams.get("invite")

      if (inviteCode) {
        try {
          const success = await UUIDSystem.processInvite(inviteCode, user.uid)

          if (success) {
            toast.success("🎉 Convite aceito! Você ganhou 10 créditos bônus!")

            // Limpar URL
            const newUrl = window.location.pathname
            window.history.replaceState({}, document.title, newUrl)
          } else {
            toast.error("Código de convite inválido ou já utilizado")
          }
        } catch (error) {
          console.error("Erro ao processar convite:", error)
          toast.error("Erro ao processar convite")
        }
      }
    }

    processInvite()
  }, [user])

  return null // Componente invisível
}
