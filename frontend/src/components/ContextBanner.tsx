'use client'

import { AppContext } from '@/lib/types'

export default function ContextBanner({ context }: { context: AppContext }) {
  // Only show when we have model number confirmed, or brand + appliance together
  const hasModel = !!context.model
  const hasBrandAndAppliance = !!(context.brand && context.appliance)
  if (!hasModel && !hasBrandAndAppliance) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
      background: '#f0faf8', borderBottom: '1px solid #c8e6e6', flexShrink: 0
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#337778" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 12 4.5-1.85 8-6.75 8-12V6L12 2z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
      <span style={{ fontSize: 11, color: '#337778', fontWeight: 600 }}>Patsy has your appliance on file:</span>
      <div style={{ display: 'flex', gap: 5 }}>
        {context.brand && (
          <span style={{ fontSize: 11, background: '#337778', color: 'white', padding: '1px 9px', borderRadius: 10, fontWeight: 500 }}>{context.brand}</span>
        )}
        {context.appliance && (
          <span style={{ fontSize: 11, background: '#337778', color: 'white', padding: '1px 9px', borderRadius: 10, fontWeight: 500 }}>{context.appliance}</span>
        )}
        {context.model && (
          <span style={{ fontSize: 11, background: 'white', color: '#337778', padding: '1px 9px', borderRadius: 10, fontWeight: 600, border: '1px solid #337778' }}>Model {context.model} ✓</span>
        )}
      </div>
    </div>
  )
}
