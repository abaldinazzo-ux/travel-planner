'use client'

import { DestinationItem, FlightData, FlightLeg, ItemStatus } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

interface FlightCardProps {
  item: DestinationItem
  onDelete: (id: string) => void
  onEdit: () => void
  onStatusChange?: (id: string, status: ItemStatus) => void
  readonly?: boolean
}

function parseFlightData(notes: string | null): FlightData | null {
  if (!notes) return null
  try { return JSON.parse(notes) } catch { return null }
}

function airportCode(airport: string): string {
  return airport.split(' - ')[0].trim()
}

function formatFlightDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
}

function LegRow({ leg, direction }: { leg: Partial<FlightLeg>; direction: string }) {
  const hasData = leg.from || leg.to || leg.date
  if (!hasData) return (
    <div className="py-4 px-5">
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.18)' }}>{direction} non configurato</p>
    </div>
  )
  return (
    <div className="py-4 px-5 flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,107,74,0.6)' }}>
        {direction}
      </span>
      <div className="flex items-baseline gap-2">
        {leg.from && <span className="font-mono font-bold" style={{ fontSize: 18, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.5px' }}>{airportCode(leg.from)}</span>}
        {(leg.from || leg.to) && <span style={{ color: 'rgba(255,107,74,0.6)', fontSize: 14 }}>→</span>}
        {leg.to && <span className="font-mono font-bold" style={{ fontSize: 18, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.5px' }}>{airportCode(leg.to)}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
        {leg.date && <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatFlightDate(leg.date)}</span>}
        {leg.time && <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{leg.time}</span>}
        {leg.airline && <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{leg.airline}</span>}
        {leg.price && <span className="text-sm font-semibold font-mono" style={{ color: '#4ECBA0' }}>€{leg.price}</span>}
        {leg.url && (
          <a href={leg.url} target="_blank" rel="noopener noreferrer"
             className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#FF6B4A' }}
             onClick={e => e.stopPropagation()}>
            Prenota →
          </a>
        )}
      </div>
    </div>
  )
}

export function FlightCard({ item, onDelete, onEdit, onStatusChange, readonly }: FlightCardProps) {
  const flight = parseFlightData(item.notes)

  return (
    <div className="rounded-2xl overflow-hidden glass-appear" style={{
      background: 'rgba(255, 107, 74, 0.07)',
      border: '1px solid rgba(255, 107, 74, 0.20)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <LegRow leg={flight?.outbound ?? {}} direction="Andata" />
      <div style={{ borderTop: '1px solid rgba(255,107,74,0.12)', margin: '0 20px' }} />
      <LegRow leg={flight?.return ?? {}} direction="Ritorno" />

      <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!readonly && <StatusBadge itemId={item.id} status={item.status ?? 'idea'} onStatusChange={onStatusChange} />}
          {item.price && item.price > 0 && (
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Totale <span style={{ color: '#4ECBA0', fontWeight: 600 }}>€{item.price.toFixed(2)}</span>
            </span>
          )}
        </div>
        {!readonly && (
          <div className="flex gap-4">
            <button onClick={onEdit} className="text-xs transition-opacity hover:opacity-100" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Modifica
            </button>
            <button onClick={() => onDelete(item.id)} className="text-xs transition-opacity hover:opacity-100" style={{ color: 'rgba(255,100,100,0.4)' }}>
              Elimina
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
