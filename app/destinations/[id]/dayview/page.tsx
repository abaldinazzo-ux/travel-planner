import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DayViewBoard } from '@/components/dayview/DayViewBoard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { DestinationTabNav } from '@/components/destinations/DestinationTabNav'
import { ShareButtonClient } from '@/app/destinations/[id]/ShareButtonClient'

export default async function DayViewPage(props: { params: Promise<{ id: string }> }) {
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
    supabase.from('destination_items').select('*').eq('destination_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!destResult.data) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 glass-nav">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <Breadcrumb items={[
              { label: 'WanderPlan', href: '/' },
              { label: `${destResult.data.emoji} ${destResult.data.name}`, href: `/destinations/${id}` },
              { label: 'Itinerario' },
            ]} />
          </div>
          <ShareButtonClient destinationId={id} />
        </div>
        <DestinationTabNav destId={id} />
      </div>

      {/* Board */}
      <DayViewBoard dest={destResult.data} initialItems={itemsResult.data ?? []} />
    </div>
  )
}
