"use client"

import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InviteManagement } from "@/components/invite-management"
import { PlansModal } from "@/components/plans-modal"
import { LogOut, User, Settings, Crown, Share2, Coins } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export function UserMenu() {
  const { user, logout } = useAuth()
  const { credits, getCurrentPlan } = useCredits()
  const [showPlansModal, setShowPlansModal] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logout realizado com sucesso!")
    } catch (error) {
      toast.error("Erro ao fazer logout")
    }
  }

  if (!user) return null

  const currentPlan = getCurrentPlan()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-accent/20">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
              <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || "Usuário"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <Coins className="w-3 h-3 text-yellow-500" />
                  <span>{credits?.credits || 0}</span>
                </div>
                <div className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">{currentPlan.name}</div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowPlansModal(true)}>
            <Crown className="mr-2 h-4 w-4" />
            <span>Planos e Créditos</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <div>
              <Share2 className="mr-2 h-4 w-4" />
              <InviteManagement />
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PlansModal open={showPlansModal} onOpenChange={setShowPlansModal} />
    </>
  )
}
