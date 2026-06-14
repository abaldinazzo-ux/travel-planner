'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Category, CATEGORY_META } from '@/lib/types'

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  destinationId: string
  category: Category
}

export function AddItemModal({ open, onClose, onCreated, destinationId, category }: AddItemModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const meta = CATEGORY_META[category]

  const reset = () => { setName(''); setPrice(''); setRating(0); setNotes(''); setUrl('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('destination_items').insert({
      destination_id: destinationId,
      category,
      name: name.trim(),
      price: price ? parseFloat(price) : null,
      rating: rating || null,
      notes: notes.trim() || null,
      url: url.trim() || null,
    })
    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast(`${meta.emoji} Aggiunto!`)
      reset()
      onCreated()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Aggiungi ${meta.label}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sand/60 text-xs uppercase tracking-wide">Nome *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`Nome ${meta.label.toLowerCase()}`}
            required
            className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand placeholder-sand/30 focus:outline-none focus:border-coral"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sand/60 text-xs uppercase tracking-wide">Prezzo (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand placeholder-sand/30 focus:outline-none focus:border-coral"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sand/60 text-xs uppercase tracking-wide">Valutazione</label>
            <div className="flex gap-1 py-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  className={`text-xl transition-colors ${n <= rating ? 'text-yellow-400' : 'text-sand/20 hover:text-yellow-400/50'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sand/60 text-xs uppercase tracking-wide">Note</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Note aggiuntive…"
            rows={2}
            className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand placeholder-sand/30 focus:outline-none focus:border-coral resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sand/60 text-xs uppercase tracking-wide">URL</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://…"
            className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand placeholder-sand/30 focus:outline-none focus:border-coral"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => { reset(); onClose() }}>
            Annulla
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvataggio…' : 'Aggiungi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
