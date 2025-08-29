"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatbotInterface } from "@/components/chatbot-interface"
import { MessageCircle, Sparkles } from "lucide-react"

export function ChatbotButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 z-50 rounded-full w-16 h-16 shadow-2xl animate-bounce hover:animate-none transition-all duration-300 bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        </div>
      </Button>

      <ChatbotInterface open={open} onOpenChange={setOpen} />
    </>
  )
}
