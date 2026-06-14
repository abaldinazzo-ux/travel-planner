'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItemStatus, STATUS_CYCLE } from '@/lib/types'

const STYLES: Record<ItemStatus, React.CSSProperties> = {
  idea: {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'rgba(255,255,255,0.60)',
  },
  found: {
    background: 'rgba(255,184,64,0.13)',
    border: '1px solid rgba(255,184,64,0.28)',
    color: '#FFB340',
  },
  booked: {
    background: 'rgba(78,203,160,0.13)',
    border: '1px solid rgba(78,203,160,0.30)',
    color: '#4ECBA0',
  },
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
    if (error) { setStatus(status); onStatusChange?.(itemId, status) }
  }

  return (
    <button
      onClick={handleClick}
      className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all duration-150 select-none"
      style={STYLES[status]}
    >
      {LABELS[status]}
    </button>
  )
}
