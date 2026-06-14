'use client'

import { DestinationItem, Category, CATEGORY_META, ItemStatus } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'

interface StatusBarProps {
  items: DestinationItem[]
  budget: number | null
}

const SHOW: Category[] = ['voli', 'hotel', 'itinerari', 'ristoranti']

type CatStatus = 'booked' | 'partial' | 'empty'

function categoryStatus(items: DestinationItem[], cat: Category): CatStatus {
  const catItems = items.filter(i => i.category === cat)
  if (catItems.length === 0) return 'empty'
  if (catItems.some(i => (i.status as ItemStatus) === 'booked')) return 'booked'
  return 'partial'
}

const PILL_STYLE: Record<CatStatus, React.CSSProperties> = {
  booked:  { background: 'rgba(78,203,160,0.15)', border: '1px solid rgba(78,203,160,0.30)', color: '#4ECBA0' },
  partial: { background: 'rgba(255,184,64,0.12)', border: '1px solid rgba(255,184,64,0.25)', color: '#FFB340' },
  empty:   { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.30)' },
}

export function StatusBar({ items, budget }: StatusBarProps) {
  const totalSpend = items.reduce((s, i) => s + (i.price ?? 0), 0)

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      {SHOW.map(cat => {
        const st = categoryStatus(items, cat)
        const meta = CATEGORY_META[cat]
        return (
          <div
            key={cat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
            style={PILL_STYLE[st]}
          >
            <CategoryIcon category={cat} size={11} strokeWidth={2} />
            <span>{meta.label}</span>
          </div>
        )
      })}

      <div className="ml-auto shrink-0 flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
        <span>💰</span>
        <span style={{ color: '#4ECBA0', fontFamily: 'monospace', fontWeight: 600 }}>€{totalSpend.toFixed(0)}</span>
        {budget && <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}> / €{Number(budget).toFixed(0)}</span>}
      </div>
    </div>
  )
}
