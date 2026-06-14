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

export function DestinationBubble({ destination, itemCount, onClick, onDragStart, onEdit, isDragging }: DestinationBubbleProps) {
  const size = bubbleSize(itemCount)
  const period = formatPeriod(destination.date_from)

  return (
    <div
      className={`absolute group flex items-center justify-center rounded-full cursor-pointer select-none
        transition-transform duration-200 hover:scale-105 ${isDragging ? 'scale-110 z-20' : 'z-10'}`}
      style={{
        width: size,
        height: size,
        left: `calc(${destination.pos_x}% - ${size / 2}px)`,
        top: `calc(${destination.pos_y}% - ${size / 2}px)`,
        background: `radial-gradient(circle at 35% 35%, ${destination.color}bb, ${destination.color}ee)`,
        boxShadow: isDragging ? `0 16px 48px ${destination.color}55` : `0 8px 28px ${destination.color}33`,
      }}
      onClick={onClick}
      onPointerDown={onDragStart}
    >
      <div className="flex flex-col items-center gap-0.5 px-3 text-center pointer-events-none">
        <span style={{ fontSize: size * 0.22 }}>{destination.emoji}</span>
        <span className="font-semibold text-white leading-tight" style={{ fontSize: Math.max(10, size * 0.12) }}>
          {destination.name}
        </span>
        {period && (
          <span className="text-white/60 leading-tight" style={{ fontSize: Math.max(8, size * 0.085) }}>
            {period}
          </span>
        )}
      </div>

      {onEdit && (
        <button
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white/80 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
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
