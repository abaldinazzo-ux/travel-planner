'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Destination, DestinationItem, formatPeriod } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'

interface DestinationWithItems extends Destination { destination_items: DestinationItem[] }
interface CompareTableProps { destinations: DestinationWithItems[] }

function calcScore(dest: Destination, items: DestinationItem[]): number {
  let score = 0
  if (dest.name) score += 1; if (dest.country) score += 1
  if (dest.date_from) score += 2; if (dest.budget) score += 1
  score += Math.min(5, new Set(items.map(i => i.category)).size)
  return Math.min(10, score)
}

function dateOverlap(a: Destination, b: Destination): boolean {
  if (!a.date_from || !b.date_from) return false
  const aD = new Date(a.date_from), bD = new Date(b.date_from)
  return aD.getFullYear() === bD.getFullYear() && aD.getMonth() === bD.getMonth()
}

const TH_STYLE: React.CSSProperties = { padding: '10px 14px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(255,255,255,0.32)', borderBottom: '1px solid rgba(255,255,255,0.07)' }
const TD_STYLE: React.CSSProperties = { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }

export function CompareTable({ destinations }: CompareTableProps) {
  const [filterOverlap, setFilterOverlap] = useState(false)

  const scored = destinations.map(d => ({
    ...d,
    score: calcScore(d, d.destination_items),
    totalSpend: d.destination_items.reduce((s, i) => s + (i.price ?? 0), 0),
    catCount: (cat: string) => d.destination_items.filter(i => i.category === cat).length,
  }))

  const best = scored.length > 0 ? scored.reduce((a, b) => a.score > b.score ? a : b) : null
  const filtered = filterOverlap ? scored.filter((d, i) => scored.some((o, j) => i !== j && dateOverlap(d, o))) : scored

  if (destinations.length === 0) {
    return (
      <div className="text-center py-24">
        <span className="text-5xl" style={{ opacity: 0.12 }}>🗺️</span>
        <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Nessuna destinazione da confrontare</p>
        <Link href="/" className="text-sm mt-3 inline-block hover:opacity-80 transition-opacity" style={{ color: '#FF6B4A' }}>
          Aggiungi destinazioni →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Best pick banner */}
      {best && (
        <div className="rounded-2xl p-5 flex items-center gap-4 glass-appear"
          style={{ background: `rgba(${hexToRgb(best.color)}, 0.12)`, border: `1px solid rgba(${hexToRgb(best.color)}, 0.25)`, backdropFilter: 'blur(20px)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `rgba(${hexToRgb(best.color)}, 0.2)` }}>
            {best.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>Consigliata</p>
            <p className="font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>{best.name}</p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>Score {best.score}/10</p>
          </div>
          <Link href={`/destinations/${best.id}`} className="text-sm hover:opacity-80 transition-opacity shrink-0" style={{ color: '#FF6B4A' }}>
            Apri →
          </Link>
        </div>
      )}

      {/* Filter */}
      <div>
        <button onClick={() => setFilterOverlap(v => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={filterOverlap
            ? { background: 'rgba(255,107,74,0.20)', border: '1px solid rgba(255,107,74,0.35)', color: '#FF6B4A' }
            : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.5)' }}>
          Stesso periodo
        </button>
      </div>

      {/* Table */}
      <div className="glass overflow-x-auto" style={{ borderRadius: 16 }}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {['Destinazione', 'Periodo', 'Budget', 'Stimato', '', '', '', 'Score'].map((h, i) => (
                <th key={i} style={{ ...TH_STYLE, textAlign: ['Budget','Stimato','Score'].includes(h) ? 'right' : 'left' }}>
                  {i === 4 ? <CategoryIcon category="voli" size={11} /> : i === 5 ? <CategoryIcon category="hotel" size={11} /> : i === 6 ? <CategoryIcon category="attivita" size={11} /> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="transition-colors duration-100" onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}>
                <td style={TD_STYLE}>
                  <Link href={`/destinations/${d.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <span>{d.emoji}</span>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{d.name}</p>
                      {d.country && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{d.country}</p>}
                    </div>
                  </Link>
                </td>
                <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.38)', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {formatPeriod(d.date_from, d.period_note) || '—'}
                </td>
                <td style={{ ...TD_STYLE, textAlign: 'right', fontFamily: 'monospace', color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>
                  {d.budget ? `€${Number(d.budget).toFixed(0)}` : '—'}
                </td>
                <td style={{ ...TD_STYLE, textAlign: 'right', fontFamily: 'monospace', color: '#4ECBA0', fontSize: 12 }}>
                  {d.totalSpend > 0 ? `€${d.totalSpend.toFixed(0)}` : '—'}
                </td>
                <td style={{ ...TD_STYLE, textAlign: 'center', color: 'rgba(255,255,255,0.38)' }}>{d.catCount('voli') || '—'}</td>
                <td style={{ ...TD_STYLE, textAlign: 'center', color: 'rgba(255,255,255,0.38)' }}>{d.catCount('hotel') || '—'}</td>
                <td style={{ ...TD_STYLE, textAlign: 'center', color: 'rgba(255,255,255,0.38)' }}>{d.catCount('attivita') || '—'}</td>
                <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold text-white font-mono"
                    style={{ background: d.color, boxShadow: `0 0 12px ${d.color}66` }}>
                    {d.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3),16); const g = parseInt(hex.slice(3,5),16); const b = parseInt(hex.slice(5,7),16)
  return `${r}, ${g}, ${b}`
}
