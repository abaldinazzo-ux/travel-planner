'use client'

import { DestinationItem } from '@/lib/types'
import { Button } from '@/components/ui/Button'

interface ItemCardProps {
  item: DestinationItem
  onDelete: (id: string) => void
  readonly?: boolean
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-sand/20'}>★</span>
      ))}
    </div>
  )
}

export function ItemCard({ item, onDelete, readonly }: ItemCardProps) {
  return (
    <div className="bg-navy-light border border-sand/10 rounded-xl p-4 flex gap-4 group hover:border-sand/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sand font-medium truncate">{item.name}</h3>
          {!readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 shrink-0"
              onClick={() => onDelete(item.id)}
            >
              ✕
            </Button>
          )}
        </div>
        <Stars rating={item.rating} />
        {item.notes && (
          <p className="text-sand/50 text-sm mt-1 line-clamp-2">{item.notes}</p>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-aqua text-xs hover:underline mt-1 inline-block truncate max-w-full"
          >
            🔗 {item.url}
          </a>
        )}
      </div>
      {item.price !== null && (
        <div className="shrink-0 text-right">
          <span className="text-aqua font-semibold text-sm">
            €{item.price.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
