'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface ShareButtonClientProps {
  destinationId: string
}

export function ShareButtonClient({ destinationId }: ShareButtonClientProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast('Devi essere autenticato', 'error'); setLoading(false); return }

    // Check if share already exists
    const { data: existing } = await supabase
      .from('trip_shares')
      .select('share_token')
      .eq('destination_id', destinationId)
      .eq('owner_id', user.id)
      .is('shared_with', null)
      .single()

    let token = existing?.share_token

    if (!token) {
      const { data, error } = await supabase
        .from('trip_shares')
        .insert({ destination_id: destinationId, owner_id: user.id, shared_with: null, can_edit: false })
        .select('share_token')
        .single()
      if (error || !data) { toast(error?.message ?? 'Errore', 'error'); setLoading(false); return }
      token = data.share_token
    }

    const url = `${window.location.origin}/share/${token}`
    await navigator.clipboard.writeText(url)
    toast('Link condivisione copiato! 🔗')
    setLoading(false)
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleShare} disabled={loading}>
      🔗 {loading ? 'Generazione…' : 'Condividi link'}
    </Button>
  )
}
