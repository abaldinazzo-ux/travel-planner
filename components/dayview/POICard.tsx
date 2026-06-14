'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { DestinationItem, ItemStatus, CATEGORY_META } from '@/lib/types'
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

  const meta = CATEGORY_META[event.item.category]
  const label = event.displayLabel ?? event.item.name

  const style = transform ? { transform: CSS.Transform.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 bg-[#0D1B2A] rounded-xl p-2.5 ring-1 ring-white/8 group
        ${isDragging ? 'opacity-40 shadow-2xl' : 'hover:ring-white/15'}
        ${event.locked ? 'opacity-90' : ''}
        transition-all`}
    >
      {/* Drag handle / lock */}
      <div
        className={`shrink-0 flex items-center text-[#6B8FA8]/40 text-xs mt-0.5 ${event.locked ? '' : 'cursor-grab active:cursor-grabbing hover:text-[#6B8FA8]'}`}
        {...(event.locked ? {} : { ...attributes, ...listeners })}
      >
        {event.locked ? '🔒' : '⠿'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start gap-1.5">
          <span className="text-xs shrink-0">{meta.emoji}</span>
          <span className="text-sand text-xs font-medium leading-snug line-clamp-2">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {!event.locked && (
            <StatusBadge
              itemId={event.item.id}
              status={event.item.status ?? 'idea'}
              onStatusChange={onStatusChange}
            />
          )}
          {event.item.price != null && (
            <span className="text-aqua text-[10px] font-mono">€{event.item.price.toFixed(0)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function POICardGhost({ event }: { event: DayViewEvent }) {
  const meta = CATEGORY_META[event.item.category]
  const label = event.displayLabel ?? event.item.name
  return (
    <div className="flex gap-2 bg-[#1A2E42] rounded-xl p-2.5 ring-1 ring-coral/40 shadow-xl rotate-1 opacity-95">
      <div className="shrink-0 text-[#6B8FA8]/40 text-xs mt-0.5">⠿</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          <span className="text-xs shrink-0">{meta.emoji}</span>
          <span className="text-sand text-xs font-medium leading-snug line-clamp-1">{label}</span>
        </div>
      </div>
    </div>
  )
}
