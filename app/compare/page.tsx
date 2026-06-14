import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { CompareTable } from '@/components/compare/CompareTable'

export default async function ComparePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data } = await supabase
    .from('destinations')
    .select('*, destination_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sand/50 hover:text-sand text-sm mb-6 transition-colors">
          ← WanderPlan
        </Link>
        <h1 className="text-sand text-2xl font-bold mb-6">Confronto destinazioni</h1>
        <CompareTable destinations={data ?? []} />
      </div>
    </div>
  )
}
