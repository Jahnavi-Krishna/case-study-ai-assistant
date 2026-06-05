'use client'

const actions = [
  { label: 'Find a part', message: 'I need help finding a part', icon: '🔍' },
  { label: 'Check compatibility', message: 'I want to check if a part is compatible with my appliance', icon: '✓' },
  { label: 'Troubleshoot', message: 'I need help troubleshooting a problem with my appliance', icon: '🔧' },
  { label: 'Install guide', message: 'I need installation instructions for a part', icon: '📖', yellow: true },
]

export default function QuickActions({ onAction }: { onAction: (message: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap px-3 py-2 border-t bg-gray-50">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.message)}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
          style={
            action.yellow
              ? { borderColor: '#F0A500', color: '#805500', background: '#FFF8E6' }
              : { borderColor: '#337778', color: '#337778', background: 'white' }
          }
        >
          {action.icon} {action.label} ↗
        </button>
      ))}
    </div>
  )
}
