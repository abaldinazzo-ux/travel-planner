'use client'

import { DestinationItem, ItemStatus } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
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
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: 10, color: n <= rating ? '#FFB340' : 'rgba(255,255,255,0.12)' }}>★</span>
      ))}
    </span>
  )
}

function parseHotelData(notes: string | null): { checkin?: string; checkout?: string; address?: string } | null {
  if (!notes) return null
  try { const p = JSON.parse(notes); if (p.checkin || p.checkout) return p } catch { /* not JSON */ }
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
    <div
      className="glass-subtle glass-appear flex gap-3 px-4 py-3.5 group transition-all duration-200"
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.16)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
    >
      {/* Category icon */}
      <div className="shrink-0 mt-0.5">
        <CategoryIcon category={item.category} size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium leading-snug text-sm" style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.1px' }}>
            {item.name}
          </span>
          {!readonly && (
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-sm shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-md hover:bg-white/10"
              style={{ color: 'rgba(255,100,100,0.6)' }}
              aria-label="Elimina"
            >
              ✕
            </button>
          )}
        </div>

        {hotel && (hotel.checkin || hotel.checkout) && (
          <p className="text-xs mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {hotel.checkin && shortDate(hotel.checkin)}
            {hotel.checkin && hotel.checkout && ' → '}
            {hotel.checkout && shortDate(hotel.checkout)}
            {nights && nights > 0 && ` · ${nights} nott${nights === 1 ? 'e' : 'i'}`}
          </p>
        )}
        {hotel?.address && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>{hotel.address}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {!readonly && <StatusBadge itemId={item.id} status={item.status ?? 'idea'} onStatusChange={onStatusChange} />}
          {!hotel && item.rating !== null && <Stars rating={item.rating} />}
        </div>

        {!hotel && item.notes && (
          <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>{item.notes}</p>
        )}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
             className="text-xs mt-1.5 inline-block truncate max-w-full hover:opacity-80 transition-opacity"
             style={{ color: '#FF6B4A' }}
             onClick={e => e.stopPropagation()}>
            {item.url}
          </a>
        )}
      </div>

      {item.price !== null && (
        <div className="shrink-0 text-right pt-0.5">
          <span className="text-sm font-semibold font-mono" style={{ color: '#4ECBA0' }}>
            €{item.price.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
