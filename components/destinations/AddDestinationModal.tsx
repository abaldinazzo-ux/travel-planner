'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { DESTINATION_COLORS, Destination } from '@/lib/types'

const EMOJIS = ['🗺️', '🏖️', '🏔️', '🌆', '🏝️', '🌍', '🗼', '🎭', '🍕', '🌸', '🎿', '🦁']
const INPUT = 'bg-[#0D1B2A] rounded-xl px-4 py-3 text-sand placeholder-sand/20 focus:outline-none ring-1 ring-white/8 focus:ring-coral/50 transition-all w-full text-sm'
const LABEL = 'text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest mb-1.5 block'

interface AddDestinationModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onDeleted?: () => void
  existingDestination?: Destination
}

export function AddDestinationModal({ open, onClose, onCreated, onDeleted, existingDestination }: AddDestinationModalProps) {
  const isEdit = !!existingDestination
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [emoji, setEmoji] = useState('🗺️')
  const [color, setColor] = useState(DESTINATION_COLORS[0])
  const [period, setPeriod] = useState('')
  const [periodNote, setPeriodNote] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (existingDestination) {
        setName(existingDestination.name)
        setCountry(existingDestination.country ?? '')
        setEmoji(existingDestination.emoji)
        setColor(existingDestination.color)
        setPeriod(existingDestination.date_from?.slice(0, 7) ?? '')
        setPeriodNote(existingDestination.period_note ?? '')
        setBudget(existingDestination.budget != null ? String(existingDestination.budget) : '')
      } else {
        setName(''); setCountry(''); setEmoji('🗺️'); setColor(DESTINATION_COLORS[0])
        setPeriod(''); setPeriodNote(''); setBudget('')
      }
      setPendingDelete(false)
    }
  }, [open, existingDestination?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()

    const payload = {
      name: name.trim(),
      country: country.trim() || null,
      emoji,
      color,
      date_from: period ? `${period}-01` : null,
      date_to: null,
      period_note: periodNote.trim() || null,
      budget: budget ? parseFloat(budget) : null,
    }

    let error
    if (isEdit) {
      ;({ error } = await supabase.from('destinations').update(payload).eq('id', existingDestination.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast('Non autenticato', 'error'); setLoading(false); return }
      ;({ error } = await supabase.from('destinations').insert({
        ...payload,
        user_id: user.id,
        pos_x: 20 + Math.random() * 60,
        pos_y: 20 + Math.random() * 60,
      }))
    }

    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast(isEdit ? `${emoji} ${name} aggiornata!` : `${emoji} ${name} aggiunta!`)
      onCreated()
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) { setPendingDelete(true); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('destinations').delete().eq('id', existingDestination!.id)
    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Destinazione eliminata', 'info')
      onDeleted?.()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modifica destinazione' : 'Nuova destinazione'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={LABEL}>Nome *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="es. Lisbona" required className={INPUT} />
          </div>
          <div className="w-32">
            <label className={LABEL}>Paese</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="es. Portogallo" className={INPUT} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-lg transition-all ${emoji === e ? 'bg-coral/80 scale-110' : 'bg-[#0D1B2A] hover:bg-[#1A2E42]'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={LABEL}>Colore</label>
          <div className="flex gap-2.5">
            {DESTINATION_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-[#1A2E42] ring-sand/50' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div>
          <label className={LABEL}>Periodo</label>
          <div className="flex gap-2">
            <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className={INPUT + ' flex-1'} />
            <input value={periodNote} onChange={e => setPeriodNote(e.target.value)} placeholder="es. prima settimana" className={INPUT + ' flex-[2]'} />
          </div>
          <p className="text-[#6B8FA8]/40 text-xs mt-1.5">Mese · note opzionali</p>
        </div>

        <div>
          <label className={LABEL}>Budget (€)</label>
          <input type="number" min="0" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="es. 1500" className={INPUT} />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Annulla</Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Aggiungi destinazione'}
          </Button>
        </div>

        {isEdit && (
          <div className="pt-1 border-t border-white/5">
            {pendingDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-red-300 text-xs flex-1">Confermi l&apos;eliminazione? Tutti i dati verranno persi.</span>
                <Button type="button" variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
                  {loading ? '…' : 'Sì, elimina'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPendingDelete(false)}>No</Button>
              </div>
            ) : (
              <button type="button" onClick={handleDelete}
                className="text-red-400/50 hover:text-red-400 text-xs transition-colors w-full text-left">
                Elimina destinazione…
              </button>
            )}
          </div>
        )}
      </form>
    </Modal>
  )
}
