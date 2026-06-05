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

function speak(text: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''))
  u.rate = 0.92
  u.pitch = 1.05
  window.speechSynthesis.speak(u)
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

  return (
    <div
      style={{ fontSize: 14, lineHeight: 1.65, color: '#1a1a1a' }}
      dangerouslySetInnerHTML={{
        __html: (done ? content : displayed)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br/>')
      }}
    />
  )
}

// Quick actions with specific, on-scope messages
const quickActions = [
  { label: 'Find a part', message: 'Help me find a specific refrigerator or dishwasher part on PartSelect' },
  { label: 'Check compatibility', message: 'I want to check if a part is compatible with my refrigerator or dishwasher model' },
  { label: 'Troubleshoot', message: 'My refrigerator or dishwasher is having a problem. Can you help me diagnose the issue and find the right replacement part?' },
  { label: 'Install guide', message: 'I need step-by-step installation instructions for a refrigerator or dishwasher part' },
]

export default function ChatPanel({ messages, isLoading, onSend, onAddToCart }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    onSend(text)
  }

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice input requires Chrome.'); return }
    const r = new SR()
    r.lang = 'en-US'
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onresult = (e: any) => { setInput(e.results[0][0].transcript); inputRef.current?.focus() }
    r.onerror = () => setListening(false)
    r.start()
  }

  const lastAsstIdx = [...messages].reverse().findIndex(m => m.role === 'assistant')
  const lastAsstId = lastAsstIdx >= 0 ? messages[messages.length - 1 - lastAsstIdx].id : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'white' }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 8, alignItems: 'flex-start'
          }}>
            {msg.role === 'assistant' && <BotAvatar size={32} />}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#337778' }}>Patsy</span>
                  <button
                    onClick={() => speak(msg.content)}
                    style={{ fontSize: 10, color: '#aaa', background: 'none', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1px 7px', cursor: 'pointer' }}
                  >
                    🔊 Listen
                  </button>
                </div>
              )}
              <div style={msg.role === 'user'
                ? { background: '#337778', color: 'white', borderRadius: 18, borderTopRightRadius: 4, padding: '10px 14px', fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word' }
                : { background: '#f4f4f5', borderRadius: 18, borderTopLeftRadius: 4, padding: '11px 14px', fontSize: 14 }
              }>
                {msg.role === 'user'
                  ? <span style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.content}</span>
                  : <TypingText content={msg.content} isLatest={msg.id === lastAsstId} />
                }
              </div>

              {msg.products && msg.products.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 10, width: '100%', maxWidth: 500 }}>
                  {msg.products.slice(0, 4).map((part, i) => (
                    <ProductCard key={part.partSelectNumber} part={part} onAddToCart={onAddToCart} isMostOrdered={i === 0} />
                  ))}
                </div>
              )}
              {msg.escalated && msg.escalationInfo && (
                <div style={{ marginTop: 8, width: '100%', maxWidth: 480 }}>
                  <EscalationCard info={msg.escalationInfo} />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <BotAvatar size={32} />
            <div style={{ background: '#f4f4f5', borderRadius: 18, borderTopLeftRadius: 4, padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#337778', animation: `bounce 1s ease infinite`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        {quickActions.map(a => (
          <button key={a.label} onClick={() => onSend(a.message)}
            style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: '1px solid #d1d5db', background: 'white', color: '#555', cursor: 'pointer', fontWeight: 500 }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={handleVoice}
          style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${listening ? '#F0A500' : '#337778'}`, background: listening ? '#FFF8E6' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>
          {listening ? '🔴' : '🎤'}
        </button>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about a part, model, or issue…"
          style={{ flex: 1, border: '1.5px solid #337778', borderRadius: 22, padding: '9px 16px', fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#1a1a1a', background: 'white', minWidth: 0 }}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}
          style={{ background: input.trim() && !isLoading ? '#337778' : '#93b5b5', color: 'white', border: 'none', borderRadius: 22, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: input.trim() && !isLoading ? 'pointer' : 'default', flexShrink: 0, fontFamily: 'inherit', transition: 'background 0.2s' }}>
          Send
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
