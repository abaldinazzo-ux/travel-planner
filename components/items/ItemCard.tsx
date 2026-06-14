'use client'

import { DestinationItem } from '@/lib/types'

interface ItemCardProps {
  item: DestinationItem
  onDelete: (id: string) => void
  readonly?: boolean
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-white/10'} style={{ fontSize: 12 }}>★</span>
      ))}
    </span>
  )
}

export function ItemCard({ item, onDelete, readonly }: ItemCardProps) {
  return (
    <div className="bg-[#1A2E42] rounded-2xl px-5 py-4 flex gap-4 group hover:bg-[#1e3550] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sand font-medium leading-snug">{item.name}</span>
          {!readonly && (
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all text-sm shrink-0 mt-0.5"
              aria-label="Elimina"
            >
              ✕
            </button>
          )}
        </div>
        {item.rating !== null && <div className="mt-1"><Stars rating={item.rating} /></div>}
        {item.notes && (
          <p className="text-[#6B8FA8] text-sm mt-1.5 line-clamp-2 leading-relaxed">{item.notes}</p>
        )}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
             className="text-coral/70 hover:text-coral text-xs mt-1.5 inline-block truncate max-w-full transition-colors"
             onClick={e => e.stopPropagation()}>
            {item.url}
          </a>
        )}
      </div>
      {item.price !== null && (
        <div className="shrink-0 text-right pt-0.5">
          <span className="text-aqua font-medium text-sm font-mono">€{item.price.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}
