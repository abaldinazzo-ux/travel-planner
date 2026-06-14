'use client'

import { DestinationItem, CATEGORY_META, SECTION_ORDER } from '@/lib/types'

interface BudgetTrackerProps {
  items: DestinationItem[]
  budget: number | null
}

// Vibrant glass-friendly colors for bar glow
const BAR_COLORS: Record<string, string> = {
  voli:       'rgba(255, 107, 74',
  hotel:      'rgba(78, 203, 160',
  ristoranti: 'rgba(255, 184, 64',
  itinerari:  'rgba(99, 210, 180',
  attivita:   'rgba(130, 180, 255',
  note:       'rgba(160, 160, 180',
}

export function BudgetTracker({ items, budget }: BudgetTrackerProps) {
  const byCategory = SECTION_ORDER.map(cat => ({
    cat,
    meta: CATEGORY_META[cat],
    spend: items.filter(i => i.category === cat).reduce((s, i) => s + (i.price ?? 0), 0),
    baseColor: BAR_COLORS[cat] ?? 'rgba(160,160,180',
  })).filter(c => c.spend > 0)

  const total = byCategory.reduce((s, c) => s + c.spend, 0)
  if (total === 0 && !budget) return null

  const maxVal = budget ? Math.max(Number(budget), total) : total

  return (
    <div className="glass p-5 flex flex-col gap-4 glass-appear">
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Budget tracker
      </p>

      {/* Bar */}
      <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {byCategory.map(c => (
          <div
            key={c.cat}
            style={{
              width: `${(c.spend / maxVal) * 100}%`,
              background: `${c.baseColor}, 0.85)`,
              boxShadow: `0 0 8px ${c.baseColor}, 0.5)`,
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {byCategory.map(c => (
          <div key={c.cat} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `${c.baseColor}, 0.85)`, boxShadow: `0 0 4px ${c.baseColor}, 0.5)` }} />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>{c.meta.label}</span>
            <span style={{ color: '#4ECBA0', fontFamily: 'monospace' }}>€{c.spend.toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-baseline gap-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Totale stimato</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>€{total.toFixed(0)}</span>
        {budget && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', fontSize: 12 }}>/ €{Number(budget).toFixed(0)}</span>
            {total > Number(budget) && (
              <span className="ml-auto text-xs font-medium" style={{ color: '#FF6B4A' }}>+€{(total - Number(budget)).toFixed(0)} over</span>
            )}
            {total <= Number(budget) && (
              <span className="ml-auto text-xs font-medium" style={{ color: '#4ECBA0' }}>€{(Number(budget) - total).toFixed(0)} rimanenti</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
