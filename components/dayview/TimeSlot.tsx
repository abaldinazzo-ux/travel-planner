'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { TimeOfDay, SLOT_META, DestinationItem, ItemStatus } from '@/lib/types'
import { POICard, DayViewEvent } from './POICard'
import { AddPOIInline } from './AddPOIInline'

interface TimeSlotProps {
  date: string
  slot: TimeOfDay
  events: DayViewEvent[]
  lockedEvents: DayViewEvent[]
  destinationId: string
  onItemCreated: (item: DestinationItem) => void
  onStatusChange: (id: string, status: ItemStatus) => void
}

export function TimeSlot({ date, slot, events, lockedEvents, destinationId, onItemCreated, onStatusChange }: TimeSlotProps) {
  const dropId = `${date}::${slot}`
  const { setNodeRef, isOver } = useDroppable({ id: dropId })
  const [showAdd, setShowAdd] = useState(false)
  const meta = SLOT_META[slot]
  const allEvents = [...lockedEvents, ...events]

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-1.5 min-h-[80px] p-2 rounded-xl transition-colors
        ${isOver ? 'bg-coral/8 ring-1 ring-coral/25' : 'hover:bg-white/2'}`}
    >
      {/* Slot header */}
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-xs">{meta.emoji}</span>
        <span className="text-[#6B8FA8]/60 text-[10px] font-medium uppercase tracking-wider">{meta.label}</span>
      </div>

      {/* Events */}
      {allEvents.map(event => (
        <POICard key={event.id} event={event} onStatusChange={onStatusChange} />
      ))}

      {/* Inline add form */}
      {showAdd ? (
        <AddPOIInline
          destinationId={destinationId}
          date={date}
          slot={slot}
          onCreated={item => { onItemCreated(item); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="text-[#6B8FA8]/30 hover:text-[#6B8FA8]/70 text-[10px] text-left transition-colors py-0.5"
        >
          + aggiungi
        </button>
      )}
    </div>
  )
}
