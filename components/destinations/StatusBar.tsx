'use client'

import { DestinationItem, Category, CATEGORY_META, ItemStatus } from '@/lib/types'

interface StatusBarProps {
  items: DestinationItem[]
  budget: number | null
}

const SHOW: Category[] = ['voli', 'hotel', 'itinerari', 'ristoranti']

function categoryStatus(items: DestinationItem[], cat: Category): 'booked' | 'partial' | 'empty' {
  const catItems = items.filter(i => i.category === cat)
  if (catItems.length === 0) return 'empty'
  if (catItems.some(i => (i.status as ItemStatus) === 'booked')) return 'booked'
  return 'partial'
}

const DOT: Record<'booked' | 'partial' | 'empty', string> = {
  booked:  'bg-green-400',
  partial: 'bg-yellow-400',
  empty:   'bg-[#6B8FA8]/30',
}

const TEXT: Record<'booked' | 'partial' | 'empty', string> = {
  booked:  'text-green-400',
  partial: 'text-yellow-400',
  empty:   'text-[#6B8FA8]/50',
}

export function StatusBar({ items, budget }: StatusBarProps) {
  const totalSpend = items.reduce((s, i) => s + (i.price ?? 0), 0)

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 border-b border-white/5 overflow-x-auto">
      {SHOW.map(cat => {
        const st = categoryStatus(items, cat)
        const meta = CATEGORY_META[cat]
        return (
          <div key={cat} className={`flex items-center gap-1.5 shrink-0 text-xs font-medium ${TEXT[st]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${DOT[st]}`} />
            <span>{meta.emoji} {meta.label}</span>
          </div>
        )
      })}

      <div className="ml-auto shrink-0 flex items-center gap-1 text-xs">
        <span className="text-[#6B8FA8]">💰</span>
        <span className="text-aqua font-mono font-medium">€{totalSpend.toFixed(0)}</span>
        {budget && (
          <span className="text-[#6B8FA8] font-mono"> / €{Number(budget).toFixed(0)}</span>
        )}
      </div>
    </div>
  )
}
