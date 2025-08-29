"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { PaymentSystem } from "@/lib/payment-system"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Wallet, Building, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { UserPlan } from "@/lib/credits-system"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlan: UserPlan | null
}

export function PaymentModal({ open, onOpenChange, selectedPlan }: PaymentModalProps) {
  const { user } = useAuth()
  const { refreshCredits } = useCredits()

  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "paypal" | "bank_transfer">("credit_card")
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePayment = async () => {
    if (!user || !selectedPlan) return

    if (paymentMethod === "credit_card") {
      if (!PaymentSystem.validateCardData(cardData.number, cardData.expiry, cardData.cvv)) {
        toast.error("Dados do cartão inválidos")
        return
      }
    }

    setLoading(true)
    try {
      const result = await PaymentSystem.processPayment(user.uid, selectedPlan.id, selectedPlan.price, paymentMethod)

      if (result.success) {
        setSuccess(true)
        await refreshCredits()
        toast.success("Pagamento processado com sucesso!")
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
        }, 3000)
      } else {
        toast.error(result.error || "Erro no pagamento")
      }
    } catch (error) {
      toast.error("Erro ao processar pagamento")
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  if (!selectedPlan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pagamento Aprovado!</h3>
            <p className="text-muted-foreground mb-4">Seu plano foi atualizado com sucesso.</p>
            <Badge className="bg-green-100 text-green-800">Plano {selectedPlan.name} Ativo</Badge>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Finalizar Pagamento</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Resumo do Plano */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Plano {selectedPlan.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedPlan.credits} créditos/mês</div>
                    </div>
                    <div className="text-xl font-bold">${selectedPlan.price}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Método de Pagamento */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Método de Pagamento</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <CreditCard className="w-4 h-4" />
                    <Label htmlFor="credit_card">Cartão de Crédito</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Wallet className="w-4 h-4" />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Building className="w-4 h-4" />
                    <Label htmlFor="bank_transfer">Transferência Bancária</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Dados do Cartão */}
              {paymentMethod === "credit_card" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Validade</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="João Silva"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Outros métodos */}
              {paymentMethod === "paypal" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">PayPal</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Você será redirecionado para o PayPal para completar o pagamento.
                  </p>
                </div>
              )}

              {paymentMethod === "bank_transfer" && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-800">Transferência Bancária</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Instruções de pagamento serão enviadas por email após a confirmação.
                  </p>
                </div>
              )}

              {/* Botão de Pagamento */}
              <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </div>
                ) : (
                  `Pagar $${selectedPlan.price}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Pagamento seguro e criptografado. Seus dados estão protegidos.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
