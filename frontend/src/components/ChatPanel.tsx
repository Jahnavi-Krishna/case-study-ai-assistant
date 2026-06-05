'use client'

import { useState, useRef, useEffect } from 'react'
import BotAvatar from './BotAvatar'
import ProductCard from './ProductCard'
import EscalationCard from './EscalationCard'
import { Message, Part } from '@/lib/types'

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
  onSend: (message: string) => void
  onAddToCart: (part: Part) => void
}

function TypingText({ content, isLatest }: { content: string; isLatest: boolean }) {
  const [displayed, setDisplayed] = useState(isLatest ? '' : content)
  const [done, setDone] = useState(!isLatest)

  useEffect(() => {
    if (!isLatest) { setDisplayed(content); setDone(true); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const iv = setInterval(() => {
      if (i < content.length) { setDisplayed(content.slice(0, ++i)) }
      else { setDone(true); clearInterval(iv) }
    }, 10)
    return () => clearInterval(iv)
  }, [content, isLatest])

  // Simple, completely working formatter that renders raw text and links beautifully
  const formatText = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
    
    // Automatically turn any text URL into a clickable standard link
    const urlRegex = /(https?:\/\/[^\s]+)/g
    html = html.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #337778; font-weight: 600; text-decoration: underline;">$1</a>')
    return html
  }

  return (
    <div
      style={{ fontSize: 14, lineHeight: 1.65, color: '#1a1a1a' }}
      dangerouslySetInnerHTML={{ __html: done ? formatText(content) : formatText(displayed) }}
    />
  )
}

const quickActions = [
  { label: 'Find a part', message: 'Help me find a part' },
  { label: 'Track order', message: 'Track my order' },
  { label: 'Return policy', message: 'What is your return policy?' },
]

export default function ChatPanel({ messages, isLoading, onSend, onAddToCart }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    onSend(text)
  }

  const lastAsstIdx = [...messages].reverse().findIndex(m => m.role === 'assistant')
  const lastAsstId = lastAsstIdx >= 0 ? messages[messages.length - 1 - lastAsstIdx].id : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'white' }}>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <BotAvatar size={32} />
            <div>
              <div style={{ background: '#f4f4f5', borderRadius: 18, borderTopLeftRadius: 4, padding: '11px 14px', fontSize: 14 }}>
                Hi! I'm <strong>Patsy</strong>. I can help you with appliance parts, checking return policies, or tracking your order status. What can I look up for you today?
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8 }}>
            {msg.role === 'assistant' && <BotAvatar size={32} />}
            <div style={{ maxWidth: '85%' }}>
              <div style={msg.role === 'user'
                ? { background: '#337778', color: 'white', borderRadius: 18, padding: '10px 14px', fontSize: 14 }
                : { background: '#f4f4f5', borderRadius: 18, padding: '11px 14px', fontSize: 14 }
              }>
                {msg.role === 'user' ? msg.content : <TypingText content={msg.content} isLatest={msg.id === lastAsstId} />}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Persistent Quick Actions Footer */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', gap: 6 }}>
        {quickActions.map(a => (
          <button key={a.label} onClick={() => onSend(a.message)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." style={{ flex: 1, border: '1px solid #337778', borderRadius: 22, padding: '8px 16px', outline: 'none' }} />
        <button onClick={handleSend} style={{ background: '#337778', color: 'white', border: 'none', borderRadius: 22, padding: '8px 16px', cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  )
}