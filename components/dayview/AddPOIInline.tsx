'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category, TimeOfDay, CATEGORY_META, DestinationItem } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'

const QUICK_CATEGORIES: Category[] = ['ristoranti', 'attivita', 'itinerari', 'note']

interface AddPOIInlineProps {
  destinationId: string
  date: string
  slot: TimeOfDay
  onCreated: (item: DestinationItem) => void
  onCancel: () => void
}

export function AddPOIInline({ destinationId, date, slot, onCreated, onCancel }: AddPOIInlineProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('attivita')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() }
  }

  const handleSave = async () => {
    if (!name.trim() || loading) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('destination_items')
      .insert({
        destination_id: destinationId,
        category,
        name: name.trim(),
        price: price ? parseFloat(price) : null,
        scheduled_date: date,
        time_of_day: slot,
        status: 'idea',
        rating: null, notes: null, url: null,
      })
      .select()
      .single()
    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    if (data) onCreated(data)
  }

  return (
    <div className="bg-[#0D1B2A] rounded-xl p-2.5 ring-1 ring-coral/40 flex flex-col gap-2">
      <input
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nome POI…"
        className="bg-transparent text-sand text-xs placeholder-sand/30 focus:outline-none w-full"
      />
      <div className="flex items-center gap-1.5 flex-wrap">
        <select
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
          className="bg-[#1A2E42] text-[#6B8FA8] text-[10px] rounded-lg px-2 py-1 focus:outline-none border-0"
        >
          {QUICK_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="€"
          className="bg-[#1A2E42] text-[#6B8FA8] text-[10px] rounded-lg px-2 py-1 w-14 focus:outline-none"
        />
        <div className="flex gap-1 ml-auto">
          <button
            onClick={handleSave}
            disabled={!name.trim() || loading}
            className="text-green-400 hover:text-green-300 text-xs disabled:opacity-30 transition-colors"
          >
            {loading ? '…' : '✓'}
          </button>
          <button onClick={onCancel} className="text-[#6B8FA8]/50 hover:text-[#6B8FA8] text-xs transition-colors">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
