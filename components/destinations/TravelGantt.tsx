'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Destination, DestinationItem, FlightData } from '@/lib/types'

interface TravelGanttProps {
  dest: Destination
  items: DestinationItem[]
}

interface GanttBar {
  id: string
  label: string
  startDate: Date
  endDate: Date
  color: string
  tooltip: string[]
}

interface GanttRow {
  label: string
  emoji: string
  bars: GanttBar[]
  isHotel?: boolean
}

// --- helpers (no external date libs) ---
function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}
function parseDate(s: string): Date {
  return new Date(s + 'T12:00:00')
}
function fmtDay(d: Date): string {
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}
function parseJSON<T>(s: string | null): T | null {
  if (!s) return null
  try { return JSON.parse(s) } catch { return null }
}
function airCode(s: string | undefined): string {
  if (!s) return '?'
  return s.split(' - ')[0].trim()
}

function buildRows(dest: Destination, items: DestinationItem[]): {
  rows: GanttRow[]
  start: Date | null
  end: Date | null
} {
  // Flight data
  const voliItem = items.find(i => i.category === 'voli')
  const fd = parseJSON<FlightData>(voliItem?.notes ?? null)
  const outbound = fd?.outbound
  const ret = fd?.return

  // Hotel data
  const hotelItems = items.filter(i => i.category === 'hotel')
  type HotelData = { checkin?: string; checkout?: string; address?: string }
  const hotels = hotelItems
    .map(item => ({ item, data: parseJSON<HotelData>(item.notes) }))
    .filter((h): h is { item: DestinationItem; data: HotelData } => !!(h.data?.checkin && h.data?.checkout))

  // Determine timeline range
  let start: Date | null = null
  let end: Date | null = null

  if (outbound?.date) start = parseDate(outbound.date)
  if (ret?.date) end = parseDate(ret.date)

  if (!start && dest.date_from) {
    start = parseDate(dest.date_from)
  }
  if (!end && dest.date_from) {
    const d = parseDate(dest.date_from)
    end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)
  }
  // Expand range to include hotels outside flight dates
  for (const h of hotels) {
    const ci = parseDate(h.data.checkin!)
    const co = parseDate(h.data.checkout!)
    if (!start || ci < start) start = ci
    if (!end || co > end) end = co
  }

  if (!start || !end || start > end) return { rows: [], start: null, end: null }

  const rows: GanttRow[] = []

  // Voli row
  const voliBars: GanttBar[] = []
  if (outbound?.date) {
    const s = parseDate(outbound.date)
    voliBars.push({
      id: 'out',
      label: `${airCode(outbound.from)} → ${airCode(outbound.to)}`,
      startDate: s, endDate: s,
      color: '#E07A5F',
      tooltip: [
        `Andata: ${fmtDay(s)}`,
        outbound.time ? `Ora: ${outbound.time}` : '',
        outbound.airline ?? '',
        outbound.price ? `€${outbound.price}` : '',
      ].filter(Boolean),
    })
  }
  if (ret?.date) {
    const s = parseDate(ret.date)
    voliBars.push({
      id: 'ret',
      label: `${airCode(ret.from)} → ${airCode(ret.to)}`,
      startDate: s, endDate: s,
      color: '#B85A3F',
      tooltip: [
        `Ritorno: ${fmtDay(s)}`,
        ret.time ? `Ora: ${ret.time}` : '',
        ret.airline ?? '',
        ret.price ? `€${ret.price}` : '',
      ].filter(Boolean),
    })
  }
  if (voliBars.length) rows.push({ label: 'Voli', emoji: '✈️', bars: voliBars })

  // Alloggio row
  const alloggioBars: GanttBar[] = hotels.map(({ item, data }) => {
    const ci = parseDate(data.checkin!)
    const co = parseDate(data.checkout!)
    const nights = diffDays(ci, co)
    return {
      id: item.id,
      label: item.name,
      startDate: ci, endDate: co,
      color: '#81B29A',
      tooltip: [
        `Check-in: ${fmtDay(ci)}`,
        `Check-out: ${fmtDay(co)}`,
        `${nights} nott${nights === 1 ? 'e' : 'i'}`,
        data.address ?? '',
        item.price ? `€${item.price.toFixed(0)}` : '',
      ].filter(Boolean),
    }
  })
  rows.push({ label: 'Alloggio', emoji: '🏨', bars: alloggioBars, isHotel: true })

  return { rows, start, end }
}

export function TravelGantt({ dest, items }: TravelGanttProps) {
  const [tooltip, setTooltip] = useState<{ lines: string[]; x: number; y: number } | null>(null)
  const { rows, start, end } = useMemo(() => buildRows(dest, items), [dest, items])

  if (!start || !end) {
    return (
      <div className="flex flex-col items-center py-20 gap-4 text-center">
        <span className="text-5xl opacity-20">📅</span>
        <p className="text-[#6B8FA8] text-sm">Nessuna data configurata</p>
        <p className="text-[#6B8FA8]/50 text-xs">
          Aggiungi i voli o imposta un periodo per visualizzare la timeline
        </p>
      </div>
    )
  }

  const totalDays = diffDays(start, end) + 1
  const days = Array.from({ length: totalDays }, (_, i) => addDays(start!, i))

  const barStyle = (bar: GanttBar) => {
    const startOff = Math.max(0, diffDays(start!, bar.startDate))
    const duration = Math.max(1, diffDays(bar.startDate, bar.endDate) + 1)
    const left = (startOff / totalDays) * 100
    const width = (duration / totalDays) * 100
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }
  }

  const dayHasHotel = (day: Date, hotelBars: GanttBar[]) =>
    hotelBars.some(b => day >= b.startDate && day <= b.endDate)

  return (
    <div className="relative">
      {/* Day header */}
      <div className="flex border-b border-white/5 pb-2 mb-1">
        <div className="w-20 shrink-0" />
        <div className="flex-1 relative h-6">
          {days.map((day, i) => {
            const showLabel = i === 0 || day.getDate() === 1 || (totalDays <= 21) || i % Math.ceil(totalDays / 14) === 0
            if (!showLabel) return null
            return (
              <div
                key={i}
                className="absolute text-[10px] text-[#6B8FA8] text-center pointer-events-none"
                style={{ left: `${(i / totalDays) * 100}%`, transform: 'translateX(-50%)' }}
              >
                {day.getDate()}
                {(i === 0 || day.getDate() === 1) && (
                  <div className="text-[9px] text-[#6B8FA8]/50">
                    {day.toLocaleDateString('it-IT', { month: 'short' })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Rows */}
      {rows.map(row => (
        <div key={row.label} className="flex items-center border-t border-white/5 py-4">
          {/* Label */}
          <div className="w-20 shrink-0 flex items-center gap-1.5">
            <span className="text-base">{row.emoji}</span>
            <span className="text-[#6B8FA8] text-xs font-medium">{row.label}</span>
          </div>

          {/* Track */}
          <div className="flex-1 relative h-8">
            {/* Day grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {days.map((day, i) => {
                const isGap = row.isHotel && row.bars.length > 0 && !dayHasHotel(day, row.bars)
                return (
                  <div
                    key={i}
                    className={`flex-1 border-r border-white/4 ${isGap ? 'bg-orange-500/8' : ''}`}
                  />
                )
              })}
            </div>

            {/* Bars */}
            {row.bars.map(bar => (
              <div
                key={bar.id}
                className="absolute top-1 bottom-1 rounded-lg flex items-center px-2 cursor-default hover:brightness-110 transition-all"
                style={{ ...barStyle(bar), background: bar.color, minWidth: 6 }}
                onMouseEnter={e => setTooltip({ lines: bar.tooltip, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
                onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
              >
                <span className="text-white text-[10px] font-medium truncate">{bar.label}</span>
              </div>
            ))}

            {/* Empty state */}
            {row.bars.length === 0 && (
              <div className="absolute inset-0 flex items-center">
                <span className="text-[#6B8FA8]/25 text-xs ml-1">
                  {row.isHotel ? 'Aggiungi alloggi con date per visualizzarli' : 'Nessun dato'}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Legend for hotel gaps */}
      {rows.some(r => r.isHotel && r.bars.length > 0) && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-2">
          <div className="w-3 h-3 rounded bg-orange-500/20 shrink-0" />
          <span className="text-[#6B8FA8]/60 text-xs">Giorni senza alloggio configurato</span>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-[#132435] border border-white/10 rounded-xl px-3 py-2 shadow-xl"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          {tooltip.lines.map((line, i) => (
            <p key={i} className={`text-xs ${i === 0 ? 'text-sand font-medium' : 'text-[#6B8FA8]'}`}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
