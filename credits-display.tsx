"use client"

import { useCredits } from "@/hooks/use-credits"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Clock, Zap } from "lucide-react"

export function CreditsDisplay() {
  const { credits, loading, getCurrentPlan, getDaysUntilExpiry } = useCredits()

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </Card>
    )
  }

  if (!credits) return null

  const currentPlan = getCurrentPlan()
  const daysLeft = getDaysUntilExpiry()

  return (
    <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold text-gray-800">{credits.credits} créditos</span>
        </div>
        <Badge
          variant="outline"
          className={`${
            currentPlan.color === "purple"
              ? "border-purple-200 text-purple-700 bg-purple-50"
              : currentPlan.color === "blue"
                ? "border-blue-200 text-blue-700 bg-blue-50"
                : "border-gray-200 text-gray-700 bg-gray-50"
          }`}
        >
          <Zap className="h-3 w-3 mr-1" />
          {currentPlan.name}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{daysLeft} dias restantes</span>
        </div>
        <div className="text-xs">Usado: {credits.totalUsed} mensagens</div>
      </div>

      {credits.credits <= 5 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">⚠️ Poucos créditos restantes. Considere fazer upgrade do seu plano.</p>
        </div>
      )}
    </Card>
  )
}
