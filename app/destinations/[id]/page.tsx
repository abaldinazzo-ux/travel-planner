import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { CategoryGrid } from '@/components/destinations/CategoryGrid'
import { ShareButtonClient } from './ShareButtonClient'
import { Destination, DestinationItem, formatPeriod } from '@/lib/types'

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

export default async function DestinationPage(props: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { id } = await props.params

  const { data: dest } = await supabase.from('destinations').select('*').eq('id', id).single()
  if (!dest) notFound()

  const { data: items } = await supabase
    .from('destination_items').select('*').eq('destination_id', id)
    .order('created_at', { ascending: false })

  const allItems: DestinationItem[] = items ?? []
  const score = calcScore(dest, allItems)
  const totalSpend = allItems.reduce((s, i) => s + (i.price ?? 0), 0)
  const period = formatPeriod(dest.date_from, dest.period_note)

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Top nav */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0D1B2A]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-[#6B8FA8] hover:text-sand text-sm transition-colors">
          <span className="text-base">←</span> WanderPlan
        </Link>
        <ShareButtonClient destinationId={id} />
      </div>

      {/* Hero */}
      <div className="px-6 pt-10 pb-8" style={{ background: `linear-gradient(160deg, ${dest.color}15 0%, transparent 60%)` }}>
        <div className="flex items-start gap-5 max-w-2xl">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${dest.color}25` }}>
            {dest.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sand text-2xl font-semibold tracking-tight">{dest.name}</h1>
            {dest.country && <p className="text-[#6B8FA8] text-sm mt-0.5">{dest.country}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              {period && (
                <span className="text-[#6B8FA8] text-sm">{period}</span>
              )}
              {dest.budget && (
                <span className="text-[#6B8FA8] text-sm">
                  Budget <span className="text-aqua font-medium font-mono">€{Number(dest.budget).toFixed(0)}</span>
                  {totalSpend > 0 && (
                    <span className="text-[#6B8FA8]"> · Stimato <span className="text-aqua font-medium font-mono">€{totalSpend.toFixed(0)}</span></span>
                  )}
                </span>
              )}
            </div>
          </div>
          {/* Score */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className="text-2xl font-semibold text-sand font-mono">{score}<span className="text-[#6B8FA8] text-base font-normal">/10</span></div>
            <span className="text-[#6B8FA8] text-[10px] uppercase tracking-widest">score</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 pb-16 max-w-2xl">
        <p className="text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest mb-4">Categorie</p>
        <CategoryGrid destinationId={id} items={allItems} />
      </div>
    </div>
  )
}
