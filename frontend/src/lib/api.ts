const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ChatResponse {
  answer: string
  products: any[]
  contextUpdates: Record<string, string>
  escalated: boolean
  escalationInfo: any
}

export async function sendMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  context: Record<string, string>,
  mode: string | null,
  imageBase64?: string,
  imageMime?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      context,
      mode,
      imageBase64: imageBase64 || null,
      imageMime: imageMime || 'image/jpeg',
    }),
  })
  if (!res.ok) throw new Error('Failed to get response from Patsy')
  return res.json()
}
