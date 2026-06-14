'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Destination, DestinationItem, formatPeriod } from '@/lib/types'

interface DestinationWithItems extends Destination {
  destination_items: DestinationItem[]
}

interface CompareTableProps {
  destinations: DestinationWithItems[]
}

function calcScore(dest: Destination, items: DestinationItem[]): number {
  let score = 0
  if (dest.name) score += 1
  if (dest.country) score += 1
  if (dest.date_from) score += 2
  if (dest.budget) score += 1
  const categories = new Set(items.map(i => i.category))
  score += Math.min(5, categories.size)
  return Math.min(10, score)
}

function dateOverlap(a: Destination, b: Destination): boolean {
  if (!a.date_from || !b.date_from) return false
  const aDate = new Date(a.date_from)
  const bDate = new Date(b.date_from)
  // Same month = overlap
  return aDate.getFullYear() === bDate.getFullYear() && aDate.getMonth() === bDate.getMonth()
}

export function CompareTable({ destinations }: CompareTableProps) {
  const [filterOverlap, setFilterOverlap] = useState(false)

  const scored = destinations.map(d => ({
    ...d,
    score: calcScore(d, d.destination_items),
    totalSpend: d.destination_items.reduce((s, i) => s + (i.price ?? 0), 0),
    catCount: (cat: string) => d.destination_items.filter(i => i.category === cat).length,
  }))

  const best = scored.length > 0 ? scored.reduce((a, b) => a.score > b.score ? a : b) : null

  const filtered = filterOverlap
    ? scored.filter((d, i) => scored.some((o, j) => i !== j && dateOverlap(d, o)))
    : scored

  if (destinations.length === 0) {
    return (
      <div className="text-center py-24 text-[#6B8FA8]">
        <div className="text-5xl mb-4 opacity-20">🗺️</div>
        <p className="text-sm">Nessuna destinazione da confrontare</p>
        <Link href="/" className="text-coral text-sm mt-3 inline-block hover:underline">Aggiungi destinazioni →</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Best pick */}
      {best && (
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: `${best.color}18`, border: `1px solid ${best.color}30` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `${best.color}25` }}>
            {best.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest mb-0.5">Consigliata</p>
            <p className="text-sand font-medium">{best.name}</p>
            <p className="text-[#6B8FA8] text-xs mt-0.5">Score {best.score}/10</p>
          </div>
          <Link href={`/destinations/${best.id}`} className="text-coral text-sm hover:underline shrink-0">
            Apri →
          </Link>
        </div>
      )}

      {/* Filter */}
      <div>
        <button
          onClick={() => setFilterOverlap(v => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterOverlap ? 'bg-coral/80 text-white' : 'bg-[#1A2E42] text-[#6B8FA8] hover:text-sand'
          }`}>
          Stesso periodo
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl ring-1 ring-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Destinazione', 'Periodo', 'Budget', 'Stimato', '✈️', '🏨', '🎯', 'Score'].map(h => (
                <th key={h} className={`px-4 py-3 text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest ${
                  ['Budget', 'Stimato', '✈️', '🏨', '🎯', 'Score'].includes(h) ? 'text-right' : 'text-left'
                }`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3.5">
                  <Link href={`/destinations/${d.id}`} className="flex items-center gap-2.5 hover:text-coral transition-colors">
                    <span>{d.emoji}</span>
                    <div>
                      <p className="text-sand font-medium">{d.name}</p>
                      {d.country && <p className="text-[#6B8FA8] text-xs">{d.country}</p>}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-[#6B8FA8] text-xs whitespace-nowrap">
                  {formatPeriod(d.date_from, d.period_note) || '—'}
                </td>
                <td className="px-4 py-3.5 text-right text-[#6B8FA8] font-mono text-xs">
                  {d.budget ? `€${Number(d.budget).toFixed(0)}` : '—'}
                </td>
                <td className="px-4 py-3.5 text-right text-aqua font-mono text-xs">
                  {d.totalSpend > 0 ? `€${d.totalSpend.toFixed(0)}` : '—'}
                </td>
                <td className="px-4 py-3.5 text-right text-[#6B8FA8]">{d.catCount('voli') || '—'}</td>
                <td className="px-4 py-3.5 text-right text-[#6B8FA8]">{d.catCount('hotel') || '—'}</td>
                <td className="px-4 py-3.5 text-right text-[#6B8FA8]">{d.catCount('attivita') || '—'}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-semibold text-white font-mono"
                    style={{ background: d.color }}>
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
