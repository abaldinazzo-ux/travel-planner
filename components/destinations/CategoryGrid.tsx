'use client'

import { useRouter } from 'next/navigation'
import { Category, CATEGORY_META, DestinationItem } from '@/lib/types'

interface CategoryGridProps {
  destinationId: string
  items: DestinationItem[]
}

const CATEGORIES: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

export function CategoryGrid({ destinationId, items }: CategoryGridProps) {
  const router = useRouter()

  const countByCategory = (cat: Category) =>
    items.filter(i => i.category === cat).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {CATEGORIES.map(cat => {
        const meta = CATEGORY_META[cat]
        const count = countByCategory(cat)
        return (
          <button
            key={cat}
            onClick={() => router.push(`/destinations/${destinationId}/${cat}`)}
            className="flex flex-col items-center justify-center gap-3 aspect-square rounded-2xl bg-navy-light border border-sand/10
              hover:border-sand/30 hover:scale-105 transition-all duration-200 cursor-pointer group"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200"
              style={{ background: `${meta.color}33`, border: `2px solid ${meta.color}66` }}
            >
              {meta.emoji}
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sand text-sm font-medium">{meta.label}</span>
              <span className="text-sand/40 text-xs">
                {count === 0 ? 'Nessun elemento' : `${count} element${count === 1 ? 'o' : 'i'}`}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
