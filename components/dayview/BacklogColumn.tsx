'use client'

import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { DestinationItem, ItemStatus, Category, CATEGORY_META } from '@/lib/types'
import { POICard, DayViewEvent } from './POICard'

const BACKLOG_CATS: Category[] = ['ristoranti', 'attivita', 'itinerari', 'note']

interface BacklogColumnProps {
  items: DestinationItem[]
  onStatusChange: (id: string, status: ItemStatus) => void
}

export function BacklogColumn({ items, onStatusChange }: BacklogColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'backlog' })
  const [filterCat, setFilterCat] = useState<Category | null>(null)

  const displayItems = useMemo(() => {
    const filtered = filterCat ? items.filter(i => i.category === filterCat) : items
    return [...filtered].sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
  }, [items, filterCat])

  // Convert to DayViewEvents for POICard
  const events: DayViewEvent[] = displayItems.map(item => ({
    id: item.id,
    item,
    date: '',
    slot: 'morning',
    locked: false,
  }))

  // Available categories in backlog
  const availableCats = [...new Set(items.map(i => i.category))].filter(c => BACKLOG_CATS.includes(c))

  return (
    <div className="w-[220px] shrink-0 flex flex-col border-r border-white/8 bg-[#111e2d]">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/8 sticky top-0 z-10 bg-[#111e2d]">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📥</span>
          <span className="text-sand text-xs font-semibold">Da pianificare</span>
          <span className="text-[#6B8FA8] text-[10px] ml-auto">{items.length}</span>
        </div>

        {/* Category filter chips */}
        {availableCats.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <button
              onClick={() => setFilterCat(null)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                filterCat === null ? 'bg-[#1A2E42] text-sand' : 'text-[#6B8FA8] hover:text-sand'
              }`}
            >
              Tutti
            </button>
            {availableCats.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                  filterCat === cat ? 'bg-[#1A2E42] text-sand' : 'text-[#6B8FA8] hover:text-sand'
                }`}
              >
                {CATEGORY_META[cat].emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drop zone + items */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 transition-colors ${
          isOver ? 'bg-aqua/5' : ''
        }`}
      >
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[#6B8FA8]/30 text-xs text-center px-2">
            {items.length === 0 ? 'Tutti gli item sono pianificati' : 'Nessun item in questa categoria'}
          </div>
        ) : (
          events.map(event => (
            <POICard key={event.id} event={event} onStatusChange={onStatusChange} />
          ))
        )}

        {/* Drop here hint */}
        {isOver && (
          <div className="border border-dashed border-aqua/30 rounded-xl p-3 text-center text-aqua/50 text-xs">
            Rilascia qui
          </div>
        )}
      </div>
    </div>
  )
}
