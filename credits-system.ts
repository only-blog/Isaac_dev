import { db } from "./firebase"
import { doc, getDoc, updateDoc, setDoc, collection, addDoc } from "firebase/firestore"

export interface UserPlan {
  id: string
  name: string
  credits: number
  price: number
  features: string[]
  duration: number // dias
  color: string
}

export const PLANS: UserPlan[] = [
  {
    id: "free",
    name: "Gratuito",
    credits: 10,
    price: 0,
    features: ["10 mensagens por mês", "Suporte básico", "Acesso limitado"],
    duration: 30,
    color: "gray",
  },
  {
    id: "flash",
    name: "Flash",
    credits: 100,
    price: 15,
    features: ["100 mensagens por mês", "Suporte prioritário", "Acesso completo", "Histórico de conversas"],
    duration: 30,
    color: "blue",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 500,
    price: 45,
    features: [
      "500 mensagens por mês",
      "Suporte 24/7",
      "Acesso ilimitado",
      "Histórico completo",
      "Análises avançadas",
      "API personalizada",
    ],
    duration: 30,
    color: "purple",
  },
]

export interface UserCredits {
  userId: string
  credits: number
  plan: string
  planExpiry: Date
  totalUsed: number
  lastReset: Date
}

export class CreditsSystem {
  // Inicializar créditos do usuário
  static async initializeUserCredits(userId: string): Promise<void> {
    try {
      const userCreditsRef = doc(db, "user_credits", userId)
      const userCreditsDoc = await getDoc(userCreditsRef)

      if (!userCreditsDoc.exists()) {
        const initialCredits: UserCredits = {
          userId,
          credits: 10, // Plano gratuito
          plan: "free",
          planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          totalUsed: 0,
          lastReset: new Date(),
        }

        await setDoc(userCreditsRef, initialCredits)
      }
    } catch (error) {
      console.error("Erro ao inicializar créditos:", error)
      throw error
    }
  }

  // Obter créditos do usuário
  static async getUserCredits(userId: string): Promise<UserCredits | null> {
    try {
      const userCreditsRef = doc(db, "user_credits", userId)
      const userCreditsDoc = await getDoc(userCreditsRef)

      if (userCreditsDoc.exists()) {
        const data = userCreditsDoc.data()
        return {
          ...data,
          planExpiry: data.planExpiry.toDate(),
          lastReset: data.lastReset.toDate(),
        } as UserCredits
      }

      return null
    } catch (error) {
      console.error("Erro ao obter créditos:", error)
      return null
    }
  }

  // Usar créditos
  static async consumeCredits(userId: string, amount = 1): Promise<boolean> {
    try {
      const userCreditsRef = doc(db, "user_credits", userId)
      const userCredits = await this.getUserCredits(userId)

      if (!userCredits || userCredits.credits < amount) {
        return false
      }

      // Verificar se o plano expirou
      if (userCredits.planExpiry < new Date()) {
        // Reset para plano gratuito
        await this.resetToFreePlan(userId)
        return false
      }

      await updateDoc(userCreditsRef, {
        credits: userCredits.credits - amount,
        totalUsed: userCredits.totalUsed + amount,
      })

      // Log da transação
      await addDoc(collection(db, "credit_transactions"), {
        userId,
        type: "usage",
        amount: -amount,
        timestamp: new Date(),
        description: "Uso do chatbot",
      })

      return true
    } catch (error) {
      console.error("Erro ao usar créditos:", error)
      return false
    }
  }

  // Adicionar créditos
  static async addCredits(userId: string, amount: number, description = "Créditos adicionados"): Promise<void> {
    try {
      const userCreditsRef = doc(db, "user_credits", userId)
      const userCredits = await this.getUserCredits(userId)

      if (userCredits) {
        await updateDoc(userCreditsRef, {
          credits: userCredits.credits + amount,
        })

        // Log da transação
        await addDoc(collection(db, "credit_transactions"), {
          userId,
          type: "addition",
          amount,
          timestamp: new Date(),
          description,
        })
      }
    } catch (error) {
      console.error("Erro ao adicionar créditos:", error)
      throw error
    }
  }

  // Atualizar plano do usuário
  static async upgradePlan(userId: string, planId: string): Promise<boolean> {
    try {
      const plan = PLANS.find((p) => p.id === planId)
      if (!plan) return false

      const userCreditsRef = doc(db, "user_credits", userId)
      const newExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)

      await updateDoc(userCreditsRef, {
        plan: planId,
        credits: plan.credits,
        planExpiry: newExpiry,
        lastReset: new Date(),
      })

      // Log da transação
      await addDoc(collection(db, "credit_transactions"), {
        userId,
        type: "plan_upgrade",
        amount: plan.credits,
        timestamp: new Date(),
        description: `Upgrade para plano ${plan.name}`,
        planId,
      })

      return true
    } catch (error) {
      console.error("Erro ao fazer upgrade do plano:", error)
      return false
    }
  }

  // Reset para plano gratuito
  static async resetToFreePlan(userId: string): Promise<void> {
    try {
      const freePlan = PLANS.find((p) => p.id === "free")!
      const userCreditsRef = doc(db, "user_credits", userId)

      await updateDoc(userCreditsRef, {
        plan: "free",
        credits: freePlan.credits,
        planExpiry: new Date(Date.now() + freePlan.duration * 24 * 60 * 60 * 1000),
        lastReset: new Date(),
      })
    } catch (error) {
      console.error("Erro ao resetar para plano gratuito:", error)
    }
  }

  // Verificar se usuário pode usar o chatbot
  static async canUseChat(userId: string): Promise<{ canUse: boolean; reason?: string }> {
    try {
      const userCredits = await this.getUserCredits(userId)

      if (!userCredits) {
        return { canUse: false, reason: "Usuário não encontrado" }
      }

      if (userCredits.planExpiry < new Date()) {
        await this.resetToFreePlan(userId)
        return { canUse: false, reason: "Plano expirado" }
      }

      if (userCredits.credits <= 0) {
        return { canUse: false, reason: "Créditos insuficientes" }
      }

      return { canUse: true }
    } catch (error) {
      console.error("Erro ao verificar uso do chat:", error)
      return { canUse: false, reason: "Erro interno" }
    }
  }
}
