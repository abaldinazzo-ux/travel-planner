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
      className="flex flex-col gap-1.5 min-h-[80px] p-2 transition-all duration-150"
      style={{
        borderTop: '1px dashed rgba(255,255,255,0.06)',
        background: isOver ? 'rgba(255,107,74,0.07)' : 'transparent',
        ...(isOver ? { border: '1px dashed rgba(255,107,74,0.38)', borderRadius: 8 } : {}),
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span style={{ fontSize: 11 }}>{meta.emoji}</span>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {meta.label}
        </span>
      </div>

      {allEvents.map(event => (
        <POICard key={event.id} event={event} onStatusChange={onStatusChange} />
      ))}

      {showAdd ? (
        <AddPOIInline
          destinationId={destinationId} date={date} slot={slot}
          onCreated={item => { onItemCreated(item); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="text-left transition-opacity hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, paddingTop: 2 }}>
          + aggiungi
        </button>
      )}
    </div>
  )
}
