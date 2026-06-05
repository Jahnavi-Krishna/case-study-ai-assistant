'use client'

import { useState } from 'react'
import { Part } from '@/lib/types'

interface ProductCardProps {
  part: Part
  onAddToCart: (part: Part) => void
  isMostOrdered?: boolean
}

const difficultyColor: Record<string, string> = {
  Easy: '#16a34a',
  Moderate: '#F0A500',
  Advanced: '#dc2626',
}

export default function ProductCard({ part, onAddToCart, isMostOrdered }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAddToCart(part)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Most ordered ribbon */}
      {isMostOrdered && (
        <div
          className="text-center py-1 text-[10px] font-semibold text-white"
          style={{ background: '#F0A500' }}
        >
          Most ordered fix
        </div>
      )}

      {/* Image */}
      <a href={part.productUrl} target="_blank" rel="noopener noreferrer">
        <div
          className="h-24 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: '#f0faf8' }}
        >
          {part.imageUrl && !imgError ? (
            <img
              src={part.imageUrl}
              alt={part.name}
              className="h-20 w-full object-contain p-1"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-4xl">
              {part.category === 'refrigerator' ? '🧊' : '🍽️'}
            </div>
          )}
        </div>
      </a>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p className="text-[10px] text-gray-400">{part.partSelectNumber}</p>
        <a
          href={part.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-gray-800 hover:text-[#337778] leading-tight transition-colors"
        >
          {part.name}
        </a>

        {/* Price + stock */}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm font-bold" style={{ color: '#337778' }}>
            ${part.price?.toFixed(2)}
          </span>
          {part.inStock && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: '#dcfce7', color: '#16a34a' }}
            >
              ✓ In stock
            </span>
          )}
        </div>

        {/* Difficulty + time */}
        {part.difficulty && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span>Install:</span>
            <span
              className="font-medium"
              style={{ color: difficultyColor[part.difficulty] ?? '#666' }}
            >
              {part.difficulty}
            </span>
            {part.estimatedTime && <span>· {part.estimatedTime}</span>}
          </div>
        )}

        {/* Fix success rate */}
        {part.fixSuccessRate && (
          <div className="text-[10px] text-gray-400">
            Fixes this issue in{' '}
            <span className="font-medium text-gray-600">{part.fixSuccessRate}%</span>{' '}
            of cases
          </div>
        )}

        {/* Video link */}
        {part.videoUrl && (
          <a
            href={part.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-medium flex items-center gap-1"
            style={{ color: '#337778' }}
          >
            📹 Watch repair video
          </a>
        )}

        {/* Buttons */}
        <div className="flex gap-1.5 mt-1.5">
          <button
            onClick={handleAdd}
            className="flex-1 text-white text-[11px] font-semibold py-1.5 rounded-lg transition-all"
            style={{ background: added ? '#16a34a' : '#F0A500' }}
          >
            {added ? '✓ Added!' : 'Add to Cart'}
          </button>
          <a
            href={part.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] px-2 py-1.5 rounded-lg border flex items-center justify-center"
            style={{ borderColor: '#337778', color: '#337778' }}
          >
            ↗
          </a>
        </div>
      </div>
    </div>
  )
}
