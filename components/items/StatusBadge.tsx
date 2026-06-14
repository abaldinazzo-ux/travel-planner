'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItemStatus, STATUS_CYCLE } from '@/lib/types'

const STYLES: Record<ItemStatus, string> = {
  idea:   'bg-white/8 text-[#6B8FA8] hover:bg-white/14',
  found:  'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25',
  booked: 'bg-green-500/15 text-green-400 hover:bg-green-500/25',
}

const LABELS: Record<ItemStatus, string> = {
  idea:   'Idea',
  found:  'Trovato',
  booked: 'Prenotato ✓',
}

interface StatusBadgeProps {
  itemId: string
  status: ItemStatus
  onStatusChange?: (id: string, status: ItemStatus) => void
}

export function StatusBadge({ itemId, status: initial, onStatusChange }: StatusBadgeProps) {
  const [status, setStatus] = useState<ItemStatus>(initial)
  const [saving, setSaving] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (saving) return
    const next = STATUS_CYCLE[status]
    setStatus(next)
    onStatusChange?.(itemId, next)
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('destination_items').update({ status: next }).eq('id', itemId)
    setSaving(false)
    if (error) {
      setStatus(status)
      onStatusChange?.(itemId, status)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all select-none ${STYLES[status]}`}
    >
      {LABELS[status]}
    </button>
  )
}
