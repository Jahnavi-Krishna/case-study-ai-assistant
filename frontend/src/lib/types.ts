export interface Part {
  partSelectNumber: string
  manufacturerPartNumber: string
  name: string
  category: 'refrigerator' | 'dishwasher'
  price: number
  inStock: boolean
  difficulty?: 'Easy' | 'Moderate' | 'Advanced'
  estimatedTime?: string
  fixSuccessRate?: number
  description: string
  imageUrl?: string
  productUrl: string
  videoUrl?: string | null
  relatedParts?: string[]
}

export interface EscalationInfo {
  message: string
  supportPhone: string
  supportEmail: string
  chatSummary: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: Part[]
  timestamp: Date
  escalated?: boolean
  escalationInfo?: EscalationInfo
}

export interface CartItem {
  part: Part
  quantity: number
}

export interface AppContext {
  appliance?: string
  brand?: string
  model?: string
}
