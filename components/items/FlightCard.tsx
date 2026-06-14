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
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
}

function LegRow({ leg, direction }: { leg: Partial<FlightLeg>; direction: string }) {
  const hasData = leg.from || leg.to || leg.date
  if (!hasData) {
    return (
      <div className="py-4 px-5">
        <p className="text-sand/20 text-sm">{direction} non configurato</p>
      </div>
    )
  }
  return (
    <div className="py-4 px-5 flex flex-col gap-1.5">
      <span className="text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest">{direction}</span>
      <div className="flex items-baseline gap-2">
        {leg.from && <span className="text-sand font-mono font-semibold text-lg">{airportCode(leg.from)}</span>}
        {(leg.from || leg.to) && <span className="text-sand/25 text-sm">→</span>}
        {leg.to && <span className="text-sand font-mono font-semibold text-lg">{airportCode(leg.to)}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
        {leg.date && <span className="text-[#6B8FA8] text-sm">{formatFlightDate(leg.date)}</span>}
        {leg.time && <span className="text-sand/50 text-sm font-mono">{leg.time}</span>}
        {leg.airline && <span className="text-sand/40 text-sm">{leg.airline}</span>}
        {leg.price && <span className="text-aqua text-sm font-medium">€{leg.price}</span>}
        {leg.url && (
          <a href={leg.url} target="_blank" rel="noopener noreferrer"
             className="text-coral text-xs hover:underline" onClick={e => e.stopPropagation()}>
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
    <div className="bg-[#1A2E42] rounded-2xl overflow-hidden">
      <LegRow leg={flight?.outbound ?? {}} direction="Andata" />
      <div className="border-t border-white/5 mx-5" />
      <LegRow leg={flight?.return ?? {}} direction="Ritorno" />

      <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!readonly && (
            <StatusBadge
              itemId={item.id}
              status={item.status ?? 'idea'}
              onStatusChange={onStatusChange}
            />
          )}
          {item.price && item.price > 0 && (
            <span className="text-[#6B8FA8] text-xs">
              Totale <span className="text-aqua font-mono font-medium">€{item.price.toFixed(2)}</span>
            </span>
          )}
        </div>
        {!readonly && (
          <div className="flex gap-4">
            <button onClick={onEdit} className="text-sand/30 hover:text-sand text-xs transition-colors">Modifica</button>
            <button onClick={() => onDelete(item.id)} className="text-red-400/30 hover:text-red-400 text-xs transition-colors">Elimina</button>
          </div>
        )}
      </div>
    </div>
  )
}
