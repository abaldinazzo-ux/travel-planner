import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ItemsList } from '@/components/items/ItemsList'
import { Category, CATEGORY_META } from '@/lib/types'

const VALID_CATEGORIES: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

export default async function CategoryPage(props: {
  params: Promise<{ id: string; category: string }>
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { id, category } = await props.params

  if (!VALID_CATEGORIES.includes(category as Category)) notFound()
  const cat = category as Category
  const meta = CATEGORY_META[cat]

  const { data: dest } = await supabase
    .from('destinations').select('id, name, emoji, color').eq('id', id).single()
  if (!dest) notFound()

  const { data: items } = await supabase
    .from('destination_items').select('*')
    .eq('destination_id', id).eq('category', cat)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Top nav */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0D1B2A]/80 backdrop-blur-md px-6 py-3">
        <Link href={`/destinations/${id}`}
          className="inline-flex items-center gap-1.5 text-[#6B8FA8] hover:text-sand text-sm transition-colors">
          <span>←</span>
          <span className="mr-1">{dest.emoji}</span>
          {dest.name}
        </Link>
      </div>

      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: `linear-gradient(160deg, ${meta.color}0f 0%, transparent 50%)` }}>
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${meta.color}20` }}>
            {meta.emoji}
          </div>
          <h1 className="text-sand text-xl font-semibold">{meta.label}</h1>
        </div>
      </div>

      <div className="px-6 pb-16 max-w-2xl">
        <ItemsList initialItems={items ?? []} destinationId={id} category={cat} />
      </div>
    </div>
  )
}
