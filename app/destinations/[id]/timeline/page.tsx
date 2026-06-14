import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { TravelGantt } from '@/components/destinations/TravelGantt'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { formatPeriod } from '@/lib/types'

export default async function TimelinePage(props: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { id } = await props.params

  const [destResult, itemsResult] = await Promise.all([
    supabase.from('destinations').select('*').eq('id', id).single(),
    supabase.from('destination_items').select('*').eq('destination_id', id),
  ])

  if (!destResult.data) notFound()
  const dest = destResult.data
  const items = itemsResult.data ?? []
  const period = formatPeriod(dest.date_from, dest.period_note)

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0D1B2A]/90 backdrop-blur-md px-4 py-3">
        <Breadcrumb items={[
          { label: 'WanderPlan', href: '/' },
          { label: `${dest.emoji} ${dest.name}`, href: `/destinations/${id}` },
          { label: 'Timeline' },
        ]} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Dest info */}
        <div className="mb-8">
          <h1 className="text-sand text-xl font-semibold flex items-center gap-2">
            <span>{dest.emoji}</span> {dest.name}
          </h1>
          {period && <p className="text-[#6B8FA8] text-sm mt-0.5">{period}</p>}
        </div>

        {/* Gantt */}
        <div className="bg-[#111e2d] rounded-2xl p-5 border border-white/5 overflow-x-auto">
          <TravelGantt dest={dest} items={items} />
        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link href={`/destinations/${id}`}
            className="text-[#6B8FA8] hover:text-sand text-sm transition-colors">
            ← Torna alla dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
