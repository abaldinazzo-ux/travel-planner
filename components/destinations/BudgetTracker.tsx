'use client'

import { DestinationItem, CATEGORY_META, SECTION_ORDER } from '@/lib/types'

interface BudgetTrackerProps {
  items: DestinationItem[]
  budget: number | null
}

export function BudgetTracker({ items, budget }: BudgetTrackerProps) {
  const byCategory = SECTION_ORDER.map(cat => ({
    cat,
    meta: CATEGORY_META[cat],
    spend: items.filter(i => i.category === cat).reduce((s, i) => s + (i.price ?? 0), 0),
  })).filter(c => c.spend > 0)

  const total = byCategory.reduce((s, c) => s + c.spend, 0)
  if (total === 0 && !budget) return null

  const maxVal = budget ? Math.max(Number(budget), total) : total

  return (
    <div className="bg-[#1A2E42] rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest">Budget tracker</p>

      {/* Bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
        {byCategory.map(c => (
          <div
            key={c.cat}
            style={{ width: `${(c.spend / maxVal) * 100}%`, background: c.meta.color }}
            className="transition-all duration-500"
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {byCategory.map(c => (
          <div key={c.cat} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.meta.color }} />
            <span className="text-[#6B8FA8]">{c.meta.emoji} {c.meta.label}</span>
            <span className="text-aqua font-mono">€{c.spend.toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-baseline gap-2 pt-1 border-t border-white/5">
        <span className="text-[#6B8FA8] text-xs">Totale stimato</span>
        <span className="text-sand font-mono font-semibold">€{total.toFixed(0)}</span>
        {budget && (
          <>
            <span className="text-[#6B8FA8] text-xs">/ €{Number(budget).toFixed(0)}</span>
            {total > Number(budget) && (
              <span className="text-coral text-xs ml-auto">
                +€{(total - Number(budget)).toFixed(0)} over budget
              </span>
            )}
            {total <= Number(budget) && (
              <span className="text-green-400 text-xs ml-auto">
                €{(Number(budget) - total).toFixed(0)} rimanenti
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
