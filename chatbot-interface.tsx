"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { useUUIDTracker } from "@/hooks/use-uuid-tracker"
import { geminiChat, type ChatMessage } from "@/lib/gemini"
import { CreditsSystem } from "@/lib/credits-system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CreditsDisplay } from "@/components/credits-display"
import { PlansModal } from "@/components/plans-modal"
import { AuthModal } from "@/components/auth-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, X, Bot, User, Sparkles, Code, Zap, Crown, Share2, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface ChatbotInterfaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatbotInterface({ open, onOpenChange }: ChatbotInterfaceProps) {
  const { user } = useAuth()
  const { credits, canUseChat, refreshCredits } = useCredits()
  const { trackAction, generateInviteLink } = useUUIDTracker()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open && user) {
      // Mensagem de boas-vindas
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Olá! 👋 Sou o assistente de programação do Isaac Muaco Dev. Estou aqui para ajudar você com qualquer dúvida sobre programação, desenvolvimento de software, algoritmos, frameworks e muito mais!\n\nComo posso ajudar você hoje?`,
        timestamp: new Date(),
        uuid: "welcome-msg",
      }
      setMessages([welcomeMessage])
      trackAction("chatbot_opened")
    }
  }, [open, user, trackAction])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return

    // Verificar se pode usar o chat
    const { canUse, reason } = await canUseChat()
    if (!canUse) {
      if (reason === "Créditos insuficientes") {
        setShowPlansModal(true)
      }
      toast.error(reason || "Não é possível usar o chat no momento")
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      uuid: (await trackAction("message_sent", { content: inputMessage })) || "",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    let creditsUsed = false
    const responsePromise = geminiChat.sendMessage(inputMessage, messages)

    try {
      creditsUsed = await CreditsSystem.consumeCredits(user.uid, 1)
      if (!creditsUsed) {
        throw new Error("Falha ao usar créditos")
      }

      // Enviar mensagem para Gemini
      const response = await responsePromise

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        uuid: (await trackAction("message_received", { response })) || "",
      }

      setMessages((prev) => [...prev, assistantMessage])
      await refreshCredits()
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      toast.error("Erro ao processar mensagem. Tente novamente.")

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
        timestamp: new Date(),
        uuid: "error-msg",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      if (!creditsUsed) {
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleGenerateInvite = async () => {
    try {
      const link = await generateInviteLink()
      if (link) {
        setInviteLink(link)
        toast.success("Link de convite gerado!")
      }
    } catch (error) {
      toast.error("Erro ao gerar link de convite")
    }
  }

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success("Link copiado!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Erro ao copiar link")
    }
  }

  const formatMessage = (content: string) => {
    // Formatação básica para código
    return content
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto"><code>$2</code></pre>',
      )
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Acesso Necessário</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Bot className="w-16 h-16 mx-auto mb-4 text-accent" />
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para acessar o assistente de programação do Isaac Muaco Dev
            </p>
            <AuthModal>
              <Button className="w-full">
                <User className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>
            </AuthModal>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden m-0 rounded-none border-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-accent/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-8 h-8 text-accent" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="font-bold text-lg">Isaac Muaco Dev Assistant</h2>
                <p className="text-sm text-muted-foreground">Especialista em Programação</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInvite}
                className="hidden sm:flex bg-transparent"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Convidar
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex h-[calc(100vh-80px)]">
            {/* Sidebar */}
            <div className="w-80 border-r bg-muted/30 p-4 space-y-4 overflow-y-auto">
              <CreditsDisplay />

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Recursos
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-500" />
                    <span>Explicações de código</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Debugging assistido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-500" />
                    <span>Melhores práticas</span>
                  </div>
                </div>
              </Card>

              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowPlansModal(true)}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade de Plano
              </Button>

              {inviteLink && (
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground mb-2">Link de Convite:</p>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="text-xs" />
                    <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-accent" />
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-accent text-accent-foreground ml-auto" : "bg-muted"
                      }`}
                    >
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content),
                        }}
                      />
                      <div className="text-xs opacity-60 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-accent rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-accent rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta sobre programação..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pressione Enter para enviar. Este assistente foca apenas em programação.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PlansModal open={showPlansModal} onOpenChange={setShowPlansModal} />
    </>
  )
}
