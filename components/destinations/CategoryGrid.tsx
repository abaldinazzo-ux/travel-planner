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
            className="flex flex-col items-center justify-center gap-3 aspect-square rounded-2xl bg-[#1A2E42]
              hover:bg-[#1e3550] transition-all duration-200 cursor-pointer group"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200"
              style={{ background: `${meta.color}20` }}
            >
              {meta.emoji}
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sand text-sm font-medium">{meta.label}</span>
              <span className="text-[#6B8FA8] text-xs">
                {count === 0 ? 'Vuoto' : `${count} element${count === 1 ? 'o' : 'i'}`}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
