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

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function isToday(d: Date): boolean {
  const now = new Date()
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function DayColumn({ day, events, lockedEvents, destinationId, onItemCreated, onStatusChange }: DayColumnProps) {
  const dateStr = isoDate(day)
  const today = isToday(day)
  const totalPOI = events.length + lockedEvents.length
  const isFull = totalPOI > 4
  const dailySpend = [...events, ...lockedEvents].reduce((s, e) => s + (e.item.price ?? 0), 0)

  const dayLabel = day.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="flex flex-col w-[200px] shrink-0 border-r border-white/5">
      {/* Column header */}
      <div className={`px-3 py-2.5 border-b border-white/5 sticky top-0 z-10 ${
        today ? 'bg-coral/15' : isFull ? 'bg-coral/8' : 'bg-[#0D1B2A]/95'
      } backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold capitalize ${today ? 'text-coral' : 'text-sand'}`}>
            {dayLabel}
          </span>
          {today && <span className="text-coral text-[10px] font-bold">OGGI</span>}
        </div>
        {totalPOI > 0 && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[#6B8FA8]/60 text-[10px]">{totalPOI} posti</span>
            {dailySpend > 0 && (
              <span className="text-aqua text-[10px] font-mono">€{dailySpend.toFixed(0)}</span>
            )}
            {isFull && <span className="text-coral text-[10px]">piena</span>}
          </div>
        )}
      </div>

      {/* Time slots */}
      <div className="flex-1 flex flex-col divide-y divide-white/5 overflow-y-auto">
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
