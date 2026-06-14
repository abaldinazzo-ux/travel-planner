'use client'

import { DestinationItem, ItemStatus } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

interface ItemCardProps {
  item: DestinationItem
  onDelete: (id: string) => void
  onStatusChange?: (id: string, status: ItemStatus) => void
  readonly?: boolean
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-white/10'} style={{ fontSize: 11 }}>★</span>
      ))}
    </span>
  )
}

function parseHotelData(notes: string | null): { checkin?: string; checkout?: string; address?: string; room_type?: string } | null {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    if (p.checkin || p.checkout) return p
  } catch { /* not JSON */ }
  return null
}

function shortDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

export function ItemCard({ item, onDelete, onStatusChange, readonly }: ItemCardProps) {
  const hotel = item.category === 'hotel' ? parseHotelData(item.notes) : null
  const nights = hotel?.checkin && hotel?.checkout
    ? Math.round((new Date(hotel.checkout + 'T12:00:00').getTime() - new Date(hotel.checkin + 'T12:00:00').getTime()) / 86400000)
    : null

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

        {/* Hotel dates */}
        {hotel && (hotel.checkin || hotel.checkout) && (
          <p className="text-[#6B8FA8] text-xs mt-1 font-mono">
            {hotel.checkin && shortDate(hotel.checkin)}
            {hotel.checkin && hotel.checkout && ' → '}
            {hotel.checkout && shortDate(hotel.checkout)}
            {nights && nights > 0 && ` · ${nights} nott${nights === 1 ? 'e' : 'i'}`}
          </p>
        )}
        {hotel?.address && (
          <p className="text-[#6B8FA8]/60 text-xs mt-0.5 truncate">{hotel.address}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {!readonly && (
            <StatusBadge itemId={item.id} status={item.status ?? 'idea'} onStatusChange={onStatusChange} />
          )}
          {!hotel && item.rating !== null && <Stars rating={item.rating} />}
        </div>

        {!hotel && item.notes && (
          <p className="text-[#6B8FA8] text-sm mt-1.5 line-clamp-2 leading-relaxed">{item.notes}</p>
        )}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
             className="text-coral/60 hover:text-coral text-xs mt-1.5 inline-block truncate max-w-full transition-colors"
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
