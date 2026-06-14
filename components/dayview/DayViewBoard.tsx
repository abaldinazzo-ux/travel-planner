'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  DndContext, DragOverlay,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import {
  Destination, DestinationItem, ItemStatus,
  FlightData, TimeOfDay,
} from '@/lib/types'
import { DayColumn } from './DayColumn'
import { BacklogColumn } from './BacklogColumn'
import { POICardGhost, type DayViewEvent } from './POICard'
import { useToast } from '@/components/ui/Toast'

interface DayViewBoardProps {
  dest: Destination
  initialItems: DestinationItem[]
}

// ─── date utils ─────────────────────────────────────────────────────────────
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function diffDays(a: Date, b: Date): number { return Math.round((b.getTime() - a.getTime()) / 86400000) }
function parseDate(s: string): Date { return new Date(s + 'T12:00:00') }
function isoDate(d: Date): string { return d.toISOString().split('T')[0] }
function parseJSON<T>(s: string | null): T | null { if (!s) return null; try { return JSON.parse(s) } catch { return null } }
function airCode(s: string | undefined): string { if (!s) return '?' ; return s.split(' - ')[0].trim() }
function inferSlot(time: string | undefined): TimeOfDay {
  if (!time) return 'morning'
  const h = parseInt(time.split(':')[0], 10)
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

// ─── compute timeline range ──────────────────────────────────────────────────
function computeDays(dest: Destination, items: DestinationItem[]): Date[] {
  const voliItem = items.find(i => i.category === 'voli')
  const fd = parseJSON<FlightData>(voliItem?.notes ?? null)

  let start: Date | null = null
  let end: Date | null = null

  if (fd?.outbound?.date) start = parseDate(fd.outbound.date)
  if (fd?.return?.date)   end   = parseDate(fd.return.date)

  if (!start && dest.date_from) { start = parseDate(dest.date_from) }
  if (!end && dest.date_from) {
    const d = parseDate(dest.date_from)
    end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)
  }
  if (!start) { const n = new Date(); start = new Date(n.getFullYear(), n.getMonth(), 1, 12) }
  if (!end)   { const n = new Date(); end   = new Date(n.getFullYear(), n.getMonth() + 1, 0, 12) }

  const total = Math.min(60, diffDays(start, end) + 1)
  return Array.from({ length: Math.max(1, total) }, (_, i) => addDays(start!, i))
}

// ─── compute locked events from voli/hotel JSON ──────────────────────────────
function computeLockedEvents(items: DestinationItem[]): DayViewEvent[] {
  const locked: DayViewEvent[] = []

  const voliItem = items.find(i => i.category === 'voli')
  const fd = parseJSON<FlightData>(voliItem?.notes ?? null)

  if (voliItem && fd?.outbound?.date) {
    locked.push({
      id: voliItem.id + '-out',
      item: voliItem,
      date: fd.outbound.date,
      slot: inferSlot(fd.outbound.time),
      locked: true,
      displayLabel: `${airCode(fd.outbound.from)} → ${airCode(fd.outbound.to)}`,
    })
  }
  if (voliItem && fd?.return?.date) {
    locked.push({
      id: voliItem.id + '-ret',
      item: voliItem,
      date: fd.return.date,
      slot: inferSlot(fd.return.time),
      locked: true,
      displayLabel: `${airCode(fd.return.from)} → ${airCode(fd.return.to)}`,
    })
  }

  type HotelData = { checkin?: string; checkout?: string }
  items.filter(i => i.category === 'hotel').forEach(h => {
    const hd = parseJSON<HotelData>(h.notes)
    if (hd?.checkin) {
      locked.push({
        id: h.id + '-hotel',
        item: h,
        date: hd.checkin,
        slot: 'morning',
        locked: true,
        displayLabel: h.name,
      })
    }
  })

  return locked
}

// ─── Main component ──────────────────────────────────────────────────────────
export function DayViewBoard({ dest, initialItems }: DayViewBoardProps) {
  const [items, setItems] = useState<DestinationItem[]>(initialItems)
  const [activeEvent, setActiveEvent] = useState<DayViewEvent | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const days = useMemo(() => computeDays(dest, items), [dest, items])
  const lockedEvents = useMemo(() => computeLockedEvents(items), [items])

  // Items that go in the backlog (unscheduled, not voli/hotel)
  const backlogItems = useMemo(() =>
    items.filter(i =>
      !i.scheduled_date &&
      i.category !== 'voli' &&
      i.category !== 'hotel'
    ), [items])

  // Scheduled items → DayViewEvents
  const scheduledEvents = useMemo((): DayViewEvent[] =>
    items
      .filter(i => i.scheduled_date && i.time_of_day && i.category !== 'voli' && i.category !== 'hotel')
      .map(i => ({
        id: i.id,
        item: i,
        date: i.scheduled_date!,
        slot: i.time_of_day!,
        locked: false,
      })),
    [items]
  )

  const handleStatusChange = useCallback((id: string, status: ItemStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }, [])

  const handleItemCreated = useCallback((item: DestinationItem) => {
    setItems(prev => [item, ...prev])
  }, [])

  // ── DnD handlers ──
  function handleDragStart({ active }: DragStartEvent) {
    const event =
      scheduledEvents.find(e => e.id === active.id) ??
      backlogItems.map(i => ({ id: i.id, item: i, date: '', slot: 'morning' as TimeOfDay, locked: false }))
        .find(e => e.id === active.id) ?? null
    setActiveEvent(event)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveEvent(null)
    if (!over) return
    const itemId = active.id as string
    const overId = over.id as string

    let newDate: string | null = null
    let newSlot: TimeOfDay | null = null

    if (overId !== 'backlog') {
      const [date, slot] = overId.split('::')
      newDate = date
      newSlot = slot as TimeOfDay
    }

    // Find current item state for revert
    const prevItem = items.find(i => i.id === itemId)
    if (!prevItem) return
    const prevDate = prevItem.scheduled_date
    const prevSlot = prevItem.time_of_day

    // Skip if no change
    if (newDate === prevDate && newSlot === prevSlot) return

    // Optimistic update
    setItems(prev => prev.map(i => i.id === itemId
      ? { ...i, scheduled_date: newDate, time_of_day: newSlot }
      : i
    ))

    // Persist
    const supabase = createClient()
    const { error } = await supabase
      .from('destination_items')
      .update({ scheduled_date: newDate, time_of_day: newSlot })
      .eq('id', itemId)

    if (error) {
      // Revert
      setItems(prev => prev.map(i => i.id === itemId
        ? { ...i, scheduled_date: prevDate, time_of_day: prevSlot }
        : i
      ))
      toast(error.message, 'error')
    }
  }

  return (
    <>
      {/* Mobile fallback */}
      <div className="md:hidden flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center">
          <p className="text-4xl mb-4 opacity-30">🖥️</p>
          <p className="text-[#6B8FA8] text-sm">La Day View è disponibile solo su desktop</p>
        </div>
      </div>

      {/* Desktop board */}
      <div className="hidden md:flex h-[calc(100vh-108px)] overflow-hidden">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Backlog */}
          <BacklogColumn items={backlogItems} onStatusChange={handleStatusChange} />

          {/* Day columns */}
          <div className="flex-1 overflow-x-auto flex">
            {days.map(day => {
              const dateStr = isoDate(day)
              const dayScheduled = scheduledEvents.filter(e => e.date === dateStr)
              const dayLocked = lockedEvents.filter(e => e.date === dateStr)
              return (
                <DayColumn
                  key={dateStr}
                  day={day}
                  events={dayScheduled}
                  lockedEvents={dayLocked}
                  destinationId={dest.id}
                  onItemCreated={handleItemCreated}
                  onStatusChange={handleStatusChange}
                />
              )
            })}
          </div>

          {/* Drag overlay */}
          <DragOverlay dropAnimation={null}>
            {activeEvent ? <POICardGhost event={activeEvent} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  )
}
