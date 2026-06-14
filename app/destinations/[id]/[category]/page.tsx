import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ItemsList } from '@/components/items/ItemsList'
import { Category, CATEGORY_META } from '@/lib/types'

const VALID_CATEGORIES: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

export default async function CategoryPage(props: {
  params: Promise<{ id: string; category: string }>
}) {
  const { id, category } = await props.params

  if (!VALID_CATEGORIES.includes(category as Category)) notFound()
  const cat = category as Category
  const meta = CATEGORY_META[cat]

  const supabase = await createClient()

  const { data: dest } = await supabase
    .from('destinations')
    .select('id, name, emoji, color')
    .eq('id', id)
    .single()

  if (!dest) notFound()

  const { data: items } = await supabase
    .from('destination_items')
    .select('*')
    .eq('destination_id', id)
    .eq('category', cat)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-navy">
      <div
        className="px-6 pt-8 pb-4"
        style={{ background: `linear-gradient(135deg, ${meta.color}11, transparent)` }}
      >
        <Link
          href={`/destinations/${id}`}
          className="inline-flex items-center gap-1 text-sand/50 hover:text-sand text-sm mb-6 transition-colors"
        >
          ← {dest.emoji} {dest.name}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.emoji}</span>
          <h1 className="text-sand text-xl font-bold">{meta.label}</h1>
        </div>
      </div>

      <div className="px-6 py-4">
        <ItemsList
          initialItems={items ?? []}
          destinationId={id}
          category={cat}
        />
      </div>
    </div>
  )
}
