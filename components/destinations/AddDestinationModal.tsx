'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { DESTINATION_COLORS, Destination } from '@/lib/types'

const EMOJIS = ['🗺️', '🏖️', '🏔️', '🌆', '🏝️', '🌍', '🗼', '🎭', '🍕', '🌸', '🎿', '🦁']

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  color: 'rgba(255,255,255,0.9)',
  fontSize: 14,
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  transition: 'all 0.2s',
}

const LABEL_STYLE: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  display: 'block',
  marginBottom: 6,
}

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
        setName(existingDestination.name); setCountry(existingDestination.country ?? '')
        setEmoji(existingDestination.emoji); setColor(existingDestination.color)
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
      name: name.trim(), country: country.trim() || null, emoji, color,
      date_from: period ? `${period}-01` : null, date_to: null,
      period_note: periodNote.trim() || null,
      budget: budget ? parseFloat(budget) : null,
    }
    let error
    if (isEdit) {
      ;({ error } = await supabase.from('destinations').update(payload).eq('id', existingDestination.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast('Non autenticato', 'error'); setLoading(false); return }
      ;({ error } = await supabase.from('destinations').insert({ ...payload, user_id: user.id, pos_x: 20 + Math.random() * 60, pos_y: 20 + Math.random() * 60 }))
    }
    setLoading(false)
    if (error) toast(error.message, 'error')
    else { toast(isEdit ? `${emoji} Aggiornata!` : `${emoji} ${name} aggiunta!`); onCreated(); onClose() }
  }

  const handleDelete = async () => {
    if (!pendingDelete) { setPendingDelete(true); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('destinations').delete().eq('id', existingDestination!.id)
    setLoading(false)
    if (error) toast(error.message, 'error')
    else { toast('Eliminata', 'info'); onDeleted?.(); onClose() }
  }

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = '1px solid rgba(255,107,74,0.5)'
    e.target.style.boxShadow = '0 0 0 3px rgba(255,107,74,0.12)'
  }
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = '1px solid rgba(255,255,255,0.10)'
    e.target.style.boxShadow = ''
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modifica destinazione' : 'Nuova destinazione'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <label style={LABEL_STYLE}>Nome *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="es. Lisbona" required style={INPUT_STYLE} onFocus={focusInput} onBlur={blurInput} />
          </div>
          <div style={{ width: 120 }}>
            <label style={LABEL_STYLE}>Paese</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="es. Portogallo" style={INPUT_STYLE} onFocus={focusInput} onBlur={blurInput} />
          </div>
        </div>

        <div>
          <label style={LABEL_STYLE}>Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className="w-9 h-9 rounded-xl text-lg transition-all duration-150"
                style={{ background: emoji === e ? 'rgba(255,107,74,0.25)' : 'rgba(255,255,255,0.06)', border: emoji === e ? '1px solid rgba(255,107,74,0.5)' : '1px solid rgba(255,255,255,0.08)', transform: emoji === e ? 'scale(1.1)' : 'scale(1)' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={LABEL_STYLE}>Colore</label>
          <div className="flex gap-3">
            {DESTINATION_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all duration-150"
                style={{ background: c, boxShadow: color === c ? `0 0 12px ${c}88, 0 0 0 3px ${c}44` : 'none', transform: color === c ? 'scale(1.2)' : 'scale(1)' }} />
            ))}
          </div>
        </div>

        <div>
          <label style={LABEL_STYLE}>Periodo</label>
          <div className="flex gap-2">
            <input type="month" value={period} onChange={e => setPeriod(e.target.value)} style={{ ...INPUT_STYLE, flex: 1 }} onFocus={focusInput} onBlur={blurInput} />
            <input value={periodNote} onChange={e => setPeriodNote(e.target.value)} placeholder="prima settimana…" style={{ ...INPUT_STYLE, flex: 2 }} onFocus={focusInput} onBlur={blurInput} />
          </div>
        </div>

        <div>
          <label style={LABEL_STYLE}>Budget (€)</label>
          <input type="number" min="0" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="es. 1500" style={INPUT_STYLE} onFocus={focusInput} onBlur={blurInput} />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Annulla</Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvataggio…' : isEdit ? 'Salva' : 'Aggiungi'}
          </Button>
        </div>

        {isEdit && (
          <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {pendingDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-xs flex-1" style={{ color: 'rgba(255,150,150,0.85)' }}>Confermi eliminazione? Tutti i dati andranno persi.</span>
                <Button type="button" variant="danger" size="sm" onClick={handleDelete} disabled={loading}>{loading ? '…' : 'Elimina'}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPendingDelete(false)}>No</Button>
              </div>
            ) : (
              <button type="button" onClick={handleDelete} className="text-xs transition-opacity hover:opacity-80" style={{ color: 'rgba(255,100,100,0.45)' }}>
                Elimina destinazione…
              </button>
            )}
          </div>
        )}
      </form>
    </Modal>
  )
}
