import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DestinationItem, Category, CATEGORY_META } from '@/lib/types'
import { ItemsList } from '@/components/items/ItemsList'

const CATEGORIES: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function SharePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const supabase = await createClient()

  const { data: share } = await supabase
    .from('trip_shares')
    .select('destination_id, can_edit')
    .eq('share_token', token)
    .single()

  if (!share) notFound()

  const { data: dest } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', share.destination_id)
    .single()

  if (!dest) notFound()

  const { data: items } = await supabase
    .from('destination_items')
    .select('*')
    .eq('destination_id', share.destination_id)
    .order('category', { ascending: true })
    .order('created_at', { ascending: false })

  const allItems: DestinationItem[] = items ?? []
  const itemsByCategory = (cat: Category) => allItems.filter(i => i.category === cat)

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="glass-nav px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sand/50 text-sm">
          <span className="text-lg">🧭</span>
          <span>WanderPlan</span>
          <span className="mx-2">·</span>
          <span>Piano condiviso (sola lettura)</span>
        </div>
        <Link href="/" className="text-coral text-sm hover:underline">
          Crea il tuo →
        </Link>
      </div>

      {/* Header */}
      <div
        className="px-6 pt-8 pb-6"
        style={{ background: `linear-gradient(135deg, ${dest.color}22, transparent)` }}
      >
        <div className="flex items-start gap-4 max-w-3xl mx-auto">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${dest.color}44`, border: `2px solid ${dest.color}` }}
          >
            {dest.emoji}
          </div>
          <div className="flex-1">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items by category */}
      <div className="max-w-3xl mx-auto px-6 pb-16 flex flex-col gap-10">
        {CATEGORIES.map(cat => {
          const catItems = itemsByCategory(cat)
          if (catItems.length === 0) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{meta.emoji}</span>
                <h2 className="text-sand font-semibold">{meta.label}</h2>
                <span className="text-sand/40 text-sm ml-auto">{catItems.length} element{catItems.length === 1 ? 'o' : 'i'}</span>
              </div>
              <ItemsList
                initialItems={catItems}
                destinationId={dest.id}
                category={cat}
                readonly
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}
