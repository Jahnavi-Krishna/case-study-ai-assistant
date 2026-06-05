'use client'

import { CartItem, Part } from '@/lib/types'

interface MiniCartProps {
  cartItems: CartItem[]
  recommendedParts: Part[]
  onRemove: (partSelectNumber: string) => void
  onAddRecommended: (part: Part) => void
}

export default function MiniCart({ cartItems, recommendedParts, onRemove, onAddRecommended }: MiniCartProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.part.price ?? 0) * item.quantity, 0)
  const cartSet = new Set(cartItems.map(i => i.part.partSelectNumber))
  const recs = recommendedParts.filter(p => !cartSet.has(p.partSelectNumber)).slice(0, 3)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fafafa', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ background: '#337778', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🛒</span>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>Your cart</span>
        </div>
        <span style={{ background: '#F0A500', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
          {cartItems.reduce((s, i) => s + i.quantity, 0)} item{cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Items */}
      {cartItems.map(item => (
        <div key={item.part.partSelectNumber} style={{ padding: '12px 14px', background: 'white', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#f0faf8', borderRadius: 8, border: '1px solid #d1e9e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {item.part.category === 'refrigerator' ? '🧊' : '🍽️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.part.name}</div>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{item.part.partSelectNumber} · Qty {item.quantity}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#337778' }}>${((item.part.price ?? 0) * item.quantity).toFixed(2)}</div>
          </div>
          <button onClick={() => onRemove(item.part.partSelectNumber)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
        </div>
      ))}

      {/* Subtotal */}
      <div style={{ padding: '12px 14px', background: 'white', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Subtotal</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>${subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#337778' }}>🚚 Shipping</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#337778' }}>FREE</span>
        </div>
        <a href="https://www.partselect.com/cart" target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', textAlign: 'center', background: '#F0A500', color: 'white', fontWeight: 700, fontSize: 13, padding: '10px', borderRadius: 8, textDecoration: 'none' }}>
          Checkout on PartSelect →
        </a>
        <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 6 }}>Secure checkout on partselect.com</div>
      </div>

      {/* Recommendations */}
      {recs.length > 0 && (
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            💡 Patsy also recommends
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recs.map(part => (
              <div key={part.partSelectNumber} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{part.category === 'refrigerator' ? '🧊' : '🍽️'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{part.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#337778' }}>${part.price?.toFixed(2)}</div>
                </div>
                <button onClick={() => onAddRecommended(part)}
                  style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid #F0A500', color: '#805500', background: '#FFF8E6', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
