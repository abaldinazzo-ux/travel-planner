import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TripDashboard } from '@/components/destinations/TripDashboard'
import { DestinationStub } from '@/lib/types'

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

  const [destResult, itemsResult, allDestsResult] = await Promise.all([
    supabase.from('destinations').select('*').eq('id', id).single(),
    supabase.from('destination_items').select('*').eq('destination_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('destinations').select('id, name, emoji')
      .eq('user_id', user.id).order('created_at', { ascending: true }),
  ])

  if (!destResult.data) notFound()

  const allDests: DestinationStub[] = allDestsResult.data ?? []
  const idx = allDests.findIndex(d => d.id === id)
  const prevDest = idx > 0 ? allDests[idx - 1] : null
  const nextDest = idx < allDests.length - 1 ? allDests[idx + 1] : null

  return (
    <TripDashboard
      dest={destResult.data}
      initialItems={itemsResult.data ?? []}
      prevDest={prevDest}
      nextDest={nextDest}
    />
  )
}
