'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { DESTINATION_COLORS } from '@/lib/types'

const EMOJIS = ['🗺️', '🏖️', '🏔️', '🌆', '🏝️', '🌍', '🗼', '🎭', '🍕', '🌸', '🎿', '🦁']

interface AddDestinationModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddDestinationModal({ open, onClose, onCreated }: AddDestinationModalProps) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [emoji, setEmoji] = useState('🗺️')
  const [color, setColor] = useState(DESTINATION_COLORS[0])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const reset = () => {
    setName(''); setCountry(''); setEmoji('🗺️'); setColor(DESTINATION_COLORS[0])
    setDateFrom(''); setDateTo(''); setBudget('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast('Non autenticato', 'error'); setLoading(false); return }

    const { error } = await supabase.from('destinations').insert({
      user_id: user.id,
      name: name.trim(),
      country: country.trim() || null,
      emoji,
      color,
      date_from: dateFrom || null,
      date_to: dateTo || null,
      budget: budget ? parseFloat(budget) : null,
      pos_x: 20 + Math.random() * 60,
      pos_y: 20 + Math.random() * 60,
    })

    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast(`${emoji} ${name} aggiunta!`)
      reset()
      onCreated()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuova destinazione">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sand/60 text-xs uppercase tracking-wide">Nome *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="es. Parigi"
              required
              className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand placeholder-sand/30 focus:outline-none focus:border-coral"
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-sand/60 text-xs uppercase tracking-wide">Paese</label>
            <input
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="es. Francia"
              className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand placeholder-sand/30 focus:outline-none focus:border-coral"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sand/60 text-xs uppercase tracking-wide">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-lg text-lg transition-all ${emoji === e ? 'bg-coral scale-110' : 'bg-navy hover:bg-navy-light'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sand/60 text-xs uppercase tracking-wide">Colore bolla</label>
          <div className="flex gap-2">
            {DESTINATION_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-sand' : ''}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sand/60 text-xs uppercase tracking-wide">Data partenza</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand focus:outline-none focus:border-coral"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sand/60 text-xs uppercase tracking-wide">Data ritorno</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand focus:outline-none focus:border-coral"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sand/60 text-xs uppercase tracking-wide">Budget (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="es. 1500"
            className="px-3 py-2 bg-navy border border-sand/20 rounded-lg text-sand placeholder-sand/30 focus:outline-none focus:border-coral"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => { reset(); onClose() }}>
            Annulla
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvataggio…' : 'Aggiungi destinazione'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
