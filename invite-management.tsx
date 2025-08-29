"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useUUIDTracker } from "@/hooks/use-uuid-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Share2, Copy, Check, Users, Gift } from "lucide-react"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"

interface InviteStats {
  totalInvites: number
  activeInvites: number
  totalEarned: number
  recentInvites: Array<{
    code: string
    createdAt: Date
    usedBy: string[]
    isActive: boolean
  }>
}

export function InviteManagement() {
  const { user } = useAuth()
  const { generateInviteLink } = useUUIDTracker()

  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<InviteStats>({
    totalInvites: 0,
    activeInvites: 0,
    totalEarned: 0,
    recentInvites: [],
  })
  const [loading, setLoading] = useState(false)

  const loadInviteStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      const q = query(collection(db, "invite_codes"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const invites = querySnapshot.docs.map((doc) => ({
        code: doc.data().code,
        createdAt: doc.data().createdAt.toDate(),
        usedBy: doc.data().usedBy || [],
        isActive: doc.data().isActive,
      }))

      const totalInvites = invites.length
      const activeInvites = invites.filter((invite) => invite.isActive).length
      const totalEarned = invites.reduce((sum, invite) => sum + invite.usedBy.length * 5, 0)

      setStats({
        totalInvites,
        activeInvites,
        totalEarned,
        recentInvites: invites.slice(0, 5),
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadInviteStats()
    }
  }, [user])

  const handleGenerateInvite = async () => {
    try {
      setLoading(true)
      const link = await generateInviteLink()
      if (link) {
        setInviteLink(link)
        await loadInviteStats() // Recarregar estatísticas
        toast.success("Link de convite gerado com sucesso!")
      }
    } catch (error) {
      toast.error("Erro ao gerar link de convite")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success("Link copiado para a área de transferência!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Erro ao copiar link")
    }
  }

  const shareViaWhatsApp = () => {
    const message = `🚀 Conheça o Isaac Muaco Dev Assistant - um chatbot especializado em programação!\n\nUse meu link de convite e ganhe 10 créditos grátis:\n${inviteLink}\n\n#Programação #IA #Desenvolvimento`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareViaEmail = () => {
    const subject = "Convite para Isaac Muaco Dev Assistant"
    const body = `Olá!\n\nGostaria de te convidar para conhecer o Isaac Muaco Dev Assistant, um chatbot especializado em programação que pode te ajudar com suas dúvidas de desenvolvimento.\n\nUse meu link de convite e ganhe 10 créditos grátis para começar:\n${inviteLink}\n\nAproveite!\n\nAtenciosamente`
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
  }

  if (!user) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          Convidar Amigos
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" />
            Sistema de Convites
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">{stats.totalInvites}</div>
                <div className="text-sm text-muted-foreground">Convites Enviados</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeInvites}</div>
                <div className="text-sm text-muted-foreground">Convites Ativos</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalEarned}</div>
                <div className="text-sm text-muted-foreground">Créditos Ganhos</div>
              </CardContent>
            </Card>
          </div>

          {/* Gerar Novo Convite */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gerar Novo Convite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleGenerateInvite} disabled={loading} className="flex-1">
                  {loading ? "Gerando..." : "Gerar Link de Convite"}
                </Button>
              </div>

              {inviteLink && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={shareViaWhatsApp} className="flex-1 bg-transparent">
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareViaEmail} className="flex-1 bg-transparent">
                      Email
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Como Funciona */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Funciona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold">Gere seu link de convite</div>
                    <div className="text-muted-foreground">Cada link é único e rastreável</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold">Compartilhe com amigos</div>
                    <div className="text-muted-foreground">Use WhatsApp, email ou redes sociais</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold">Ganhe recompensas</div>
                    <div className="text-muted-foreground">5 créditos para você, 10 para seu amigo</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Convites */}
          {stats.recentInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convites Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentInvites.map((invite, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-mono text-xs text-muted-foreground">{invite.code.slice(0, 8)}...</div>
                          <div className="text-sm">{invite.createdAt.toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={invite.isActive ? "default" : "secondary"}>{invite.usedBy.length} usos</Badge>
                        <Badge variant={invite.isActive ? "default" : "outline"}>
                          {invite.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
