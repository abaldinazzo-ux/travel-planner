'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { DestinationItem, ItemStatus } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { StatusBadge } from '@/components/items/StatusBadge'

export interface DayViewEvent {
  id: string
  item: DestinationItem
  date: string
  slot: string
  locked: boolean
  displayLabel?: string
}

interface POICardProps {
  event: DayViewEvent
  onStatusChange?: (id: string, status: ItemStatus) => void
}

export function POICard({ event, onStatusChange }: POICardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    disabled: event.locked,
  })

  const label = event.displayLabel ?? event.item.name

  const baseTransform = CSS.Transform.toString(transform)
  const cardStyle: React.CSSProperties = {
    transform: isDragging && transform ? `${baseTransform} scale(1.03) rotate(1deg)` : (baseTransform ?? undefined),
    background: isDragging ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: isDragging ? '1px solid rgba(255,107,74,0.45)' : '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10,
    boxShadow: isDragging ? '0 12px 40px rgba(0,0,0,0.45)' : 'none',
    opacity: isDragging ? 0.85 : 1,
    transition: isDragging ? 'none' : 'all 0.15s cubic-bezier(0.4,0,0.2,1)',
  }

  return (
    <div ref={setNodeRef} style={cardStyle} className="flex gap-1.5 p-2">
      {/* Drag handle / lock */}
      <div
        className="shrink-0 flex items-center mt-0.5"
        style={{ color: 'rgba(255,255,255,0.25)', cursor: event.locked ? 'default' : 'grab' }}
        {...(event.locked ? {} : { ...attributes, ...listeners })}
      >
        {event.locked
          ? <span style={{ fontSize: 10 }}>🔒</span>
          : <GripVertical size={13} strokeWidth={1.5} />}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start gap-1">
          <CategoryIcon category={event.item.category} size={11} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginTop: 2 }} />
          <span className="text-xs font-medium leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {!event.locked && (
            <StatusBadge itemId={event.item.id} status={event.item.status ?? 'idea'} onStatusChange={onStatusChange} />
          )}
          {event.item.price != null && (
            <span className="font-mono" style={{ fontSize: 10, color: '#4ECBA0' }}>€{event.item.price.toFixed(0)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function POICardGhost({ event }: { event: DayViewEvent }) {
  const label = event.displayLabel ?? event.item.name
  return (
    <div className="flex gap-1.5 p-2.5 rounded-xl rotate-1"
      style={{ background: 'rgba(255,107,74,0.18)', border: '1px solid rgba(255,107,74,0.40)', backdropFilter: 'blur(20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.45)' }}>
      <GripVertical size={13} strokeWidth={1.5} style={{ color: 'rgba(255,107,74,0.7)', flexShrink: 0, marginTop: 2 }} />
      <span className="text-xs font-medium line-clamp-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{label}</span>
    </div>
  )
}
