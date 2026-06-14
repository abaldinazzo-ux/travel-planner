'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Destination, DestinationItem } from '@/lib/types'

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
  if (dest.date_from && dest.date_to) score += 2
  if (dest.budget) score += 1
  const categories = new Set(items.map(i => i.category))
  score += Math.min(5, categories.size)
  return Math.min(10, score)
}

function dateOverlap(a: Destination, b: Destination): boolean {
  if (!a.date_from || !a.date_to || !b.date_from || !b.date_to) return false
  return new Date(a.date_from) <= new Date(b.date_to) && new Date(b.date_from) <= new Date(a.date_to)
}

export function CompareTable({ destinations }: CompareTableProps) {
  const [filterOverlap, setFilterOverlap] = useState(false)

  const scored = destinations.map(d => ({
    ...d,
    score: calcScore(d, d.destination_items),
    totalSpend: d.destination_items.reduce((s, i) => s + (i.price ?? 0), 0),
    catCount: (cat: string) => d.destination_items.filter(i => i.category === cat).length,
  }))

  const best = scored.reduce((a, b) => a.score > b.score ? a : b, scored[0])

  const filtered = filterOverlap
    ? scored.filter((d, i) =>
        scored.some((other, j) => i !== j && dateOverlap(d, other))
      )
    : scored

  if (destinations.length === 0) {
    return (
      <div className="text-center py-20 text-sand/40">
        <div className="text-5xl mb-4">🗺️</div>
        <p>Nessuna destinazione da confrontare</p>
        <Link href="/" className="text-coral text-sm mt-2 inline-block hover:underline">
          Aggiungi destinazioni →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Best pick banner */}
      {best && (
        <div
          className="rounded-2xl p-5 border flex items-center gap-4"
          style={{ background: `${best.color}22`, borderColor: `${best.color}44` }}
        >
          <span className="text-4xl">{best.emoji}</span>
          <div>
            <p className="text-sand/50 text-xs uppercase tracking-wide mb-0.5">Destinazione consigliata</p>
            <p className="text-sand font-semibold text-lg">{best.name}</p>
            <p className="text-sand/50 text-sm">Score: {best.score}/10</p>
          </div>
          <div className="ml-auto">
            <Link
              href={`/destinations/${best.id}`}
              className="text-coral text-sm hover:underline"
            >
              Vai →
            </Link>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterOverlap(v => !v)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterOverlap ? 'bg-coral text-white' : 'bg-navy-light text-sand/60 hover:text-sand border border-sand/10'}`}
        >
          📅 Sovrapposizione date
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-sand/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand/10 bg-navy-light">
              <th className="text-left px-4 py-3 text-sand/50 font-medium">Destinazione</th>
              <th className="text-left px-4 py-3 text-sand/50 font-medium">Periodo</th>
              <th className="text-right px-4 py-3 text-sand/50 font-medium">Budget</th>
              <th className="text-right px-4 py-3 text-sand/50 font-medium">Stimato</th>
              <th className="text-center px-4 py-3 text-sand/50 font-medium">✈️</th>
              <th className="text-center px-4 py-3 text-sand/50 font-medium">🏨</th>
              <th className="text-center px-4 py-3 text-sand/50 font-medium">🎯</th>
              <th className="text-center px-4 py-3 text-sand/50 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr
                key={d.id}
                className={`border-b border-sand/5 hover:bg-sand/5 transition-colors ${i % 2 === 0 ? 'bg-navy' : 'bg-navy-light/30'}`}
              >
                <td className="px-4 py-3">
                  <Link href={`/destinations/${d.id}`} className="flex items-center gap-2 hover:text-coral transition-colors">
                    <span>{d.emoji}</span>
                    <div>
                      <p className="text-sand font-medium">{d.name}</p>
                      {d.country && <p className="text-sand/40 text-xs">{d.country}</p>}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-sand/60 text-xs">
                  {d.date_from
                    ? `${new Date(d.date_from).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} – ${d.date_to ? new Date(d.date_to).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : '?'}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right text-sand/60">
                  {d.budget ? `€${Number(d.budget).toFixed(0)}` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-aqua">
                  {d.totalSpend > 0 ? `€${d.totalSpend.toFixed(0)}` : '—'}
                </td>
                <td className="px-4 py-3 text-center text-sand/60">{d.catCount('voli') || '—'}</td>
                <td className="px-4 py-3 text-center text-sand/60">{d.catCount('hotel') || '—'}</td>
                <td className="px-4 py-3 text-center text-sand/60">{d.catCount('attivita') || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                    style={{ background: d.color }}
                  >
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
