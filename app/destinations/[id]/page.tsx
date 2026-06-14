import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CategoryGrid } from '@/components/destinations/CategoryGrid'
import { ShareButtonClient } from './ShareButtonClient'
import { Destination, DestinationItem } from '@/lib/types'

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

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function DestinationPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: dest } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single()

  if (!dest) notFound()

  const { data: items } = await supabase
    .from('destination_items')
    .select('*')
    .eq('destination_id', id)
    .order('created_at', { ascending: false })

  const allItems: DestinationItem[] = items ?? []
  const score = calcScore(dest, allItems)
  const totalSpend = allItems.reduce((s, i) => s + (i.price ?? 0), 0)

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <div
        className="px-6 pt-8 pb-6"
        style={{ background: `linear-gradient(135deg, ${dest.color}22, transparent)` }}
      >
        <Link href="/" className="inline-flex items-center gap-1 text-sand/50 hover:text-sand text-sm mb-6 transition-colors">
          ← WanderPlan
        </Link>

        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${dest.color}44`, border: `2px solid ${dest.color}` }}
          >
            {dest.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sand text-2xl font-bold">{dest.name}</h1>
            {dest.country && <p className="text-sand/60 text-sm">{dest.country}</p>}
            <div className="flex flex-wrap gap-4 mt-3">
              {(dest.date_from || dest.date_to) && (
                <div className="text-xs text-sand/50">
                  📅 {formatDate(dest.date_from)} → {formatDate(dest.date_to)}
                </div>
              )}
              {dest.budget && (
                <div className="text-xs text-aqua">
                  💰 Budget: €{Number(dest.budget).toFixed(0)}
                  {totalSpend > 0 && ` · Stimato: €${totalSpend.toFixed(0)}`}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div
              className="w-12 h-12 rounded-full border-4 flex items-center justify-center text-sm font-bold text-sand"
              style={{ borderColor: dest.color }}
            >
              {score}/10
            </div>
            <span className="text-sand/40 text-xs">score</span>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="px-6 pb-4">
        <ShareButtonClient destinationId={id} />
      </div>

      {/* Category Grid */}
      <div className="px-6 pb-10">
        <h2 className="text-sand/50 text-xs uppercase tracking-wide mb-4">Categorie</h2>
        <CategoryGrid destinationId={id} items={allItems} />
      </div>
    </div>
  )
}
