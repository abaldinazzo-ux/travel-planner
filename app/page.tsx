import { createClient } from '@/lib/supabase/server'
import { BubbleCanvas } from '@/components/destinations/BubbleCanvas'
import { Destination } from '@/lib/types'

export default async function HomePage() {
  let userId: string | null = null
  let destinations: (Destination & { item_count: number })[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null

    if (user) {
      const { data } = await supabase
        .from('destinations')
        .select('*, destination_items(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      destinations = (data ?? []).map((d: Destination & { destination_items: { count: number }[] }) => ({
        ...d,
        item_count: d.destination_items?.[0]?.count ?? 0,
      }))
    }
  } catch {
    // Supabase not configured or unreachable — render the landing/login UI anyway
  }

  return (
    <BubbleCanvas
      initialDestinations={destinations}
      userId={userId}
    />
  )
}
