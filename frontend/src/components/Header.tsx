export default function Header() {
  return (
    <div style={{ flexShrink: 0 }}>
      {/* Main nav */}
      <div style={{ background: '#337778', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#F0A500', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 800, letterSpacing: -0.5 }}>PS</span>
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.3 }}>PartSelect</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Parts Assistant</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://www.partselect.com" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>
            partselect.com ↗
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '4px 12px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7bffb8' }} />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>Patsy is online</span>
          </div>
        </div>
      </div>

      {/* Trust bar — matching PartSelect icons */}
      <div style={{ background: '#F0A500', padding: '5px 20px', display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <TrustItem icon={<PriceIcon />} label="Price Match Guarantee" />
        <TrustItem icon={<ShippingIcon />} label="Fast Shipping" />
        <TrustItem icon={<OEMIcon />} label="All Original Manufacturer Parts" />
        <TrustItem icon={<WarrantyIcon />} label="1 Year Warranty" />
      </div>
    </div>
  )
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'white', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ color: 'white', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

function PriceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <path d="M9 9h1a2 2 0 0 1 0 4H9v2h4" />
    </svg>
  )
}

function ShippingIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 6v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function OEMIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function WarrantyIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 12 4.5-1.85 8-6.75 8-12V6L12 2z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}
