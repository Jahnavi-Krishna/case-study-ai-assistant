'use client'

import { useRef } from 'react'

interface ModeSelectorProps {
  onSelect: (mode: string, initialMessage?: string) => void
}

const modes = [
  { id: 'part_number', title: 'I know my part number', description: 'Fast path to install steps and cart', example: 'e.g. PS11752778' },
  { id: 'model_symptom', title: 'I know my model number', description: "Give me your model and I'll find the right part", example: 'e.g. WDT780SAEM1' },
  { id: 'symptom_only', title: 'I just know the symptom', description: "Describe what's wrong — I'll walk you through it", example: 'e.g. ice maker stopped working' },
]

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleStart = () => {
    const val = inputRef.current?.value.trim()
    if (val) onSelect('symptom_only', val)
    else onSelect('symptom_only')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', overflowY: 'auto', padding: '0 16px 32px' }}>

      {/* Greeting */}
      <div style={{ textAlign: 'center', padding: '36px 0 28px', maxWidth: 500, width: '100%' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.5, marginBottom: 6 }}>
          Hi, I&apos;m Patsy.
        </div>
        <div style={{ fontSize: 15, color: '#666', lineHeight: 1.5 }}>
          PartSelect&apos;s AI expert for refrigerator and dishwasher parts — I help you find the right part, check compatibility, and guide repairs.
        </div>
      </div>

      {/* Main input — prominent */}
      <div style={{ width: '100%', maxWidth: 540, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Describe your issue, paste a part or model number…"
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            style={{
              flex: 1,
              border: '2px solid #337778',
              borderRadius: 28,
              padding: '13px 18px',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit',
              color: '#1a1a1a',
              background: 'white',
              minWidth: 0,
            }}
          />
          <button
            onClick={handleStart}
            style={{
              background: '#337778',
              color: 'white',
              border: 'none',
              borderRadius: 28,
              padding: '13px 22px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            Ask Patsy
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', maxWidth: 540, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500, letterSpacing: 0.5 }}>OR START WITH</span>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </div>

      {/* Mode options — smaller, clean */}
      <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 12,
              background: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              gap: 12,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#337778'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#f0faf8'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'white'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{mode.title}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{mode.description}</div>
            </div>
            {/* Premium chevron */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1.5px solid #337778',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#337778', fontSize: 14, fontWeight: 700, flexShrink: 0
            }}>
              ›
            </div>
          </button>
        ))}
      </div>

      {/* PartSelect link */}
      <div style={{ marginTop: 32, fontSize: 12, color: '#bbb', textAlign: 'center' }}>
        Powered by genuine OEM parts from{' '}
        <a href="https://www.partselect.com" target="_blank" rel="noopener noreferrer"
          style={{ color: '#337778', fontWeight: 600, textDecoration: 'none' }}>
          partselect.com
        </a>
      </div>

    </div>
  )
}
