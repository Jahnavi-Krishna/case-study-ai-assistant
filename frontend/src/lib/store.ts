import { create } from 'zustand'
import { CartItem, AppContext, Message, Part } from './types'

interface AppStore {
  messages: Message[]
  cartItems: CartItem[]
  context: AppContext
  mode: string | null
  addMessage: (message: Message) => void
  updateLastMessage: (updates: Partial<Message>) => void
  addToCart: (part: Part) => void
  removeFromCart: (partSelectNumber: string) => void
  updateContext: (updates: Partial<AppContext>) => void
  setMode: (mode: string) => void
}

export const useStore = create<AppStore>((set) => ({
  messages: [],
  cartItems: [],
  context: {},
  mode: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (updates) =>
    set((state) => {
      const msgs = [...state.messages]
      if (msgs.length === 0) return {}
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...updates }
      return { messages: msgs }
    }),

  addToCart: (part) =>
    set((state) => {
      const existing = state.cartItems.find(
        (i) => i.part.partSelectNumber === part.partSelectNumber
      )
      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.part.partSelectNumber === part.partSelectNumber
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { cartItems: [...state.cartItems, { part, quantity: 1 }] }
    }),

  removeFromCart: (partSelectNumber) =>
    set((state) => ({
      cartItems: state.cartItems.filter(
        (i) => i.part.partSelectNumber !== partSelectNumber
      ),
    })),

  updateContext: (updates) =>
    set((state) => ({ context: { ...state.context, ...updates } })),

  setMode: (mode) => set({ mode }),
}))
