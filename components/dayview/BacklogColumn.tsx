'use client'

import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { DestinationItem, ItemStatus, Category, CATEGORY_META } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
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

  const events: DayViewEvent[] = displayItems.map(item => ({
    id: item.id, item, date: '', slot: 'morning', locked: false,
  }))

  const availableCats = [...new Set(items.map(i => i.category))].filter(c => BACKLOG_CATS.includes(c))

  return (
    <div className="flex flex-col shrink-0" style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)' }}>
      {/* Header */}
      <div className="px-3 py-2.5 sticky top-0 z-10"
        style={{ background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13 }}>📥</span>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>Da pianificare</span>
          <span className="ml-auto" style={{ color: 'rgba(255,255,255,0.30)', fontSize: 11 }}>{items.length}</span>
        </div>
        {availableCats.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <button onClick={() => setFilterCat(null)}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-150"
              style={filterCat === null
                ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)' }
                : { background: 'transparent', color: 'rgba(255,255,255,0.35)' }}>
              Tutti
            </button>
            {availableCats.map(cat => (
              <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                className="px-1.5 py-0.5 rounded-md text-[10px] transition-all duration-150"
                style={filterCat === cat
                  ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)' }
                  : { background: 'transparent', color: 'rgba(255,255,255,0.35)' }}>
                <CategoryIcon category={cat} size={11} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 transition-colors duration-150"
        style={{ background: isOver ? 'rgba(78,203,160,0.06)' : 'transparent' }}
      >
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-center px-2"
            style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11 }}>
            {items.length === 0 ? 'Tutti pianificati' : 'Nessun item'}
          </div>
        ) : (
          events.map(event => <POICard key={event.id} event={event} onStatusChange={onStatusChange} />)
        )}
        {isOver && (
          <div className="rounded-xl p-3 text-center text-xs"
            style={{ border: '1px dashed rgba(78,203,160,0.35)', color: 'rgba(78,203,160,0.55)' }}>
            Rilascia qui
          </div>
        )}
      </div>
    </div>
  )
}
