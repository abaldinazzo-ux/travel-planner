'use client'

import { Destination } from '@/lib/types'

interface DestinationBubbleProps {
  destination: Destination
  itemCount: number
  onClick: () => void
  onDragStart: (e: React.PointerEvent) => void
  isDragging: boolean
}

function bubbleSize(count: number): number {
  return Math.min(160, Math.max(100, 100 + count * 5))
}

function formatDateRange(from: string | null, to: string | null): string {
  if (!from && !to) return ''
  const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })
  if (from && to) return `${fmt(from)} – ${fmt(to)}`
  if (from) return `Dal ${fmt(from)}`
  return `Fino al ${fmt(to!)}`
}

export function DestinationBubble({
  destination,
  itemCount,
  onClick,
  onDragStart,
  isDragging,
}: DestinationBubbleProps) {
  const size = bubbleSize(itemCount)

  return (
    <div
      className={`absolute flex items-center justify-center rounded-full cursor-pointer select-none
        transition-transform duration-200 hover:scale-105 ${isDragging ? 'scale-110 z-20 shadow-2xl' : 'z-10'}`}
      style={{
        width: size,
        height: size,
        left: `calc(${destination.pos_x}% - ${size / 2}px)`,
        top: `calc(${destination.pos_y}% - ${size / 2}px)`,
        background: `radial-gradient(circle at 35% 35%, ${destination.color}cc, ${destination.color})`,
        boxShadow: `0 8px 32px ${destination.color}44`,
      }}
      onClick={onClick}
      onPointerDown={onDragStart}
    >
      <div className="flex flex-col items-center gap-1 px-3 text-center pointer-events-none">
        <span style={{ fontSize: size * 0.22 }}>{destination.emoji}</span>
        <span
          className="font-semibold text-white leading-tight"
          style={{ fontSize: Math.max(10, size * 0.12) }}
        >
          {destination.name}
        </span>
        {(destination.date_from || destination.date_to) && (
          <span
            className="text-white/70 leading-tight"
            style={{ fontSize: Math.max(8, size * 0.09) }}
          >
            {formatDateRange(destination.date_from, destination.date_to)}
          </span>
        )}
      </div>
    </div>
  )
}
