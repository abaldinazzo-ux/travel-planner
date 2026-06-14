'use client'

import { Destination, formatPeriod } from '@/lib/types'

interface DestinationBubbleProps {
  destination: Destination
  itemCount: number
  onClick: () => void
  onDragStart: (e: React.PointerEvent) => void
  onEdit?: () => void
  isDragging: boolean
}

function bubbleSize(count: number): number {
  return Math.min(160, Math.max(100, 100 + count * 5))
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export function DestinationBubble({ destination, itemCount, onClick, onDragStart, onEdit, isDragging }: DestinationBubbleProps) {
  const size = bubbleSize(itemCount)
  const period = formatPeriod(destination.date_from)
  const rgb = hexToRgb(destination.color)

  return (
    <div
      className={`absolute group flex items-center justify-center rounded-full cursor-pointer select-none
        transition-all duration-200 cubic-bezier(0.4,0,0.2,1) hover:scale-105
        ${isDragging ? 'scale-110 z-20' : 'z-10'}`}
      style={{
        width: size,
        height: size,
        left: `calc(${destination.pos_x}% - ${size / 2}px)`,
        top: `calc(${destination.pos_y}% - ${size / 2}px)`,
        background: `rgba(${rgb}, 0.22)`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid rgba(${rgb}, 0.40)`,
        boxShadow: isDragging
          ? `0 0 50px rgba(${rgb}, 0.55), 0 20px 60px rgba(0,0,0,0.45)`
          : `0 0 24px rgba(${rgb}, 0.25), 0 8px 32px rgba(0,0,0,0.35)`,
      }}
      onClick={onClick}
      onPointerDown={onDragStart}
    >
      <div className="flex flex-col items-center gap-0.5 px-3 text-center pointer-events-none">
        <span style={{ fontSize: size * 0.22 }}>{destination.emoji}</span>
        <span className="font-semibold leading-tight" style={{ fontSize: Math.max(10, size * 0.12), color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.2px' }}>
          {destination.name}
        </span>
        {period && (
          <span style={{ fontSize: Math.max(8, size * 0.085), color: 'rgba(255,255,255,0.5)' }}>
            {period}
          </span>
        )}
      </div>

      {onEdit && (
        <button
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)' }}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onEdit() }}
          aria-label="Modifica destinazione"
        >
          ✎
        </button>
      )}
    </div>
  )
}
