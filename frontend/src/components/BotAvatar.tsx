export default function BotAvatar({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-label="Patsy the PartSelect assistant"
      style={{ flexShrink: 0 }}
    >
      <circle cx="32" cy="32" r="28" fill="#FFF8E6" stroke="#F0A500" strokeWidth="2" />
      <rect x="26" y="6" width="12" height="7" rx="3" fill="#F0A500" />
      <circle cx="32" cy="6" r="5" fill="#F0A500" />
      <circle cx="22" cy="30" r="5" fill="#2d2d2d" />
      <circle cx="42" cy="30" r="5" fill="#2d2d2d" />
      <circle cx="20.5" cy="28.5" r="1.8" fill="white" />
      <circle cx="40.5" cy="28.5" r="1.8" fill="white" />
      <circle cx="14" cy="39" r="5.5" fill="#F0A500" opacity="0.3" />
      <circle cx="50" cy="39" r="5.5" fill="#F0A500" opacity="0.3" />
      <ellipse cx="32" cy="43" rx="11" ry="6" fill="white" />
      <path
        d="M22 43 Q32 50 42 43"
        stroke="#2d2d2d"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
