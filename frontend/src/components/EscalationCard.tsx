'use client'

import { EscalationInfo } from '@/lib/types'

export default function EscalationCard({ info }: { info: EscalationInfo }) {
  return (
    <div
      className="rounded-xl border p-4 mt-2"
      style={{ background: '#FFF8E6', borderColor: '#F0A500' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">👨‍🔧</span>
        <span className="font-semibold text-sm" style={{ color: '#805500' }}>
          Connecting you to a PartSelect technician
        </span>
      </div>

      {info.chatSummary && (
        <div className="mb-3 p-2.5 bg-white rounded-lg border border-orange-100">
          <p className="text-[11px] font-medium text-gray-500 mb-1">
            Summary of our conversation (share this with the tech):
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">{info.chatSummary}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <a
          href={`tel:${info.supportPhone}`}
          className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg text-white"
          style={{ background: '#337778' }}
        >
          📞 {info.supportPhone}
          <span className="text-[11px] font-normal opacity-80">Mon–Sat 8am–8pm EST</span>
        </a>
        <a
          href={`mailto:${info.supportEmail}`}
          className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg border"
          style={{ borderColor: '#337778', color: '#337778' }}
        >
          ✉️ {info.supportEmail}
        </a>
      </div>
    </div>
  )
}
