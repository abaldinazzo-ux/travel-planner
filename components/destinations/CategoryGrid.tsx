'use client'

import { useRouter } from 'next/navigation'
import { Category, CATEGORY_META, DestinationItem } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'

interface CategoryGridProps {
  destinationId: string
  items: DestinationItem[]
}

const CATEGORIES: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

export function CategoryGrid({ destinationId, items }: CategoryGridProps) {
  const router = useRouter()
  const countByCategory = (cat: Category) => items.filter(i => i.category === cat).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CATEGORIES.map(cat => {
        const meta = CATEGORY_META[cat]
        const count = countByCategory(cat)
        return (
          <button
            key={cat}
            onClick={() => router.push(`/destinations/${destinationId}/${cat}`)}
            className="flex flex-col items-center justify-center gap-3 aspect-square glass-subtle transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
            style={{ '--hover-border': 'rgba(255,255,255,0.18)' } as React.CSSProperties}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
              style={{ background: `rgba(${hexToRgb(meta.color)}, 0.18)` }}
            >
              <CategoryIcon category={cat} size={22} style={{ color: meta.color }} />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.88)' }}>{meta.label}</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                {count === 0 ? 'Vuoto' : `${count} element${count === 1 ? 'o' : 'i'}`}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
