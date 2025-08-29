import { v4 as uuidv4 } from "uuid"
import { db } from "./firebase"
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore"

export interface UUIDAction {
  id: string
  uuid: string
  userId: string
  action: string
  data: any
  timestamp: Date
  referralCode?: string
}

export class UUIDSystem {
  // Gerar UUID único para cada ação
  static generateUUID(): string {
    return uuidv4()
  }

  // Registrar ação com UUID
  static async logAction(userId: string, action: string, data: any = {}, referralCode?: string): Promise<string> {
    const uuid = this.generateUUID()

    try {
      const actionData: any = {
        uuid,
        userId,
        action,
        data,
        timestamp: new Date(),
      }

      // Só adicionar referralCode se não for undefined
      if (referralCode !== undefined && referralCode !== null) {
        actionData.referralCode = referralCode
      }

      await addDoc(collection(db, "uuid_actions"), actionData)

      return uuid
    } catch (error) {
      console.error("Erro ao registrar ação UUID:", error)
      throw error
    }
  }

  // Gerar link de convite único
  static async generateInviteLink(userId: string): Promise<string> {
    const inviteCode = this.generateUUID()
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

    try {
      await addDoc(collection(db, "invite_codes"), {
        code: inviteCode,
        userId,
        createdAt: new Date(),
        usedBy: [],
        isActive: true,
      })

      return `${baseUrl}?invite=${inviteCode}`
    } catch (error) {
      console.error("Erro ao gerar link de convite:", error)
      throw error
    }
  }

  // Processar convite
  static async processInvite(inviteCode: string, newUserId: string): Promise<boolean> {
    try {
      const q = query(collection(db, "invite_codes"), where("code", "==", inviteCode))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return false

      const inviteDoc = querySnapshot.docs[0]
      const inviteData = inviteDoc.data()

      if (!inviteData.isActive) return false

      // Adicionar usuário à lista de convidados
      const updatedUsedBy = [...(inviteData.usedBy || []), newUserId]

      await updateDoc(doc(db, "invite_codes", inviteDoc.id), {
        usedBy: updatedUsedBy,
      })

      // Dar créditos bônus para ambos os usuários
      await this.addCredits(inviteData.userId, 5) // Quem convidou
      await this.addCredits(newUserId, 10) // Quem foi convidado

      return true
    } catch (error) {
      console.error("Erro ao processar convite:", error)
      return false
    }
  }

  // Adicionar créditos
  static async addCredits(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const currentCredits = userDoc.data().credits || 0
        await updateDoc(userRef, {
          credits: currentCredits + amount,
        })
      }
    } catch (error) {
      console.error("Erro ao adicionar créditos:", error)
    }
  }
}
