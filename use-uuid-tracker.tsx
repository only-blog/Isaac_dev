"use client"

import { useAuth } from "./use-auth"
import { UUIDSystem } from "@/lib/uuid-system"
import { useCallback } from "react"

export function useUUIDTracker() {
  const { user } = useAuth()

  const trackAction = useCallback(
    async (action: string, data: any = {}) => {
      if (!user) return null

      try {
        const uuid = await UUIDSystem.logAction(user.uid, action, data)
        console.log(`[v0] Ação rastreada: ${action} - UUID: ${uuid}`)
        return uuid
      } catch (error) {
        console.error("[v0] Erro ao rastrear ação:", error)
        return null
      }
    },
    [user],
  )

  const generateInviteLink = useCallback(async () => {
    if (!user) return null

    try {
      const link = await UUIDSystem.generateInviteLink(user.uid)
      await trackAction("invite_generated", { link })
      return link
    } catch (error) {
      console.error("[v0] Erro ao gerar link de convite:", error)
      return null
    }
  }, [user, trackAction])

  return {
    trackAction,
    generateInviteLink,
  }
}
