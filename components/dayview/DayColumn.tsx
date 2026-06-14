'use client'

import { DestinationItem, ItemStatus, TIME_SLOTS, TimeOfDay } from '@/lib/types'
import { TimeSlot } from './TimeSlot'
import { DayViewEvent } from './POICard'

interface DayColumnProps {
  day: Date
  events: DayViewEvent[]
  lockedEvents: DayViewEvent[]
  destinationId: string
  onItemCreated: (item: DestinationItem) => void
  onStatusChange: (id: string, status: ItemStatus) => void
}

function isoDate(d: Date): string { return d.toISOString().split('T')[0] }

function isToday(d: Date): boolean {
  const n = new Date()
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

export function DayColumn({ day, events, lockedEvents, destinationId, onItemCreated, onStatusChange }: DayColumnProps) {
  const dateStr = isoDate(day)
  const today = isToday(day)
  const totalPOI = events.length + lockedEvents.length
  const isFull = totalPOI > 4
  const dailySpend = [...events, ...lockedEvents].reduce((s, e) => s + (e.item.price ?? 0), 0)
  const dayLabel = day.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="flex flex-col shrink-0" style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div
        className="px-3 py-2.5 sticky top-0 z-10"
        style={{
          background: today
            ? 'rgba(255,107,74,0.14)'
            : isFull
              ? 'rgba(255,107,74,0.07)'
              : 'rgba(10,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold capitalize" style={{ color: today ? '#FF6B4A' : 'rgba(255,255,255,0.82)', letterSpacing: '-0.1px' }}>
            {dayLabel}
          </span>
          {today && <span style={{ color: '#FF6B4A', fontSize: 9, fontWeight: 700, letterSpacing: '0.5px' }}>OGGI</span>}
        </div>
        {totalPOI > 0 && (
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 10 }}>{totalPOI} posti</span>
            {dailySpend > 0 && <span style={{ color: '#4ECBA0', fontSize: 10, fontFamily: 'monospace' }}>€{dailySpend.toFixed(0)}</span>}
            {isFull && <span style={{ color: '#FF6B4A', fontSize: 9 }}>piena</span>}
          </div>
        )}
      </div>

      {/* Slots */}
      <div className="flex-1 flex flex-col overflow-y-auto px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.015)' }}>
        {TIME_SLOTS.map(slot => {
          const slotEvents = events.filter(e => e.slot === slot)
          const slotLocked = lockedEvents.filter(e => e.slot === slot)
          return (
            <TimeSlot
              key={slot}
              date={dateStr}
              slot={slot as TimeOfDay}
              events={slotEvents}
              lockedEvents={slotLocked}
              destinationId={destinationId}
              onItemCreated={onItemCreated}
              onStatusChange={onStatusChange}
            />
          )
        })}
      </div>
    </div>
  )
}
