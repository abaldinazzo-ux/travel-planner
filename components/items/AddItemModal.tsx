'use client'

import { useState, useMemo } from 'react'
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

const INPUT = 'bg-[#0D1B2A] rounded-xl px-4 py-3 text-sand placeholder-sand/20 focus:outline-none ring-1 ring-white/8 focus:ring-coral/50 transition-all w-full text-sm'
const LABEL = 'text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest mb-1.5 block'

export function AddItemModal({ open, onClose, onCreated, destinationId, category }: AddItemModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [url, setUrl] = useState('')
  // Hotel-specific
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [address, setAddress] = useState('')
  const [roomType, setRoomType] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const meta = CATEGORY_META[category]
  const isHotel = category === 'hotel'

  const nights = useMemo(() => {
    if (!checkin || !checkout) return null
    const diff = Math.round((new Date(checkout + 'T12:00:00').getTime() - new Date(checkin + 'T12:00:00').getTime()) / 86400000)
    return diff > 0 ? diff : null
  }, [checkin, checkout])

  const reset = () => {
    setName(''); setPrice(''); setRating(0); setNotes(''); setUrl('')
    setCheckin(''); setCheckout(''); setAddress(''); setRoomType('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const notesValue = isHotel
      ? JSON.stringify({
          checkin: checkin || undefined,
          checkout: checkout || undefined,
          address: address.trim() || undefined,
          room_type: roomType.trim() || undefined,
        })
      : notes.trim() || null

    const supabase = createClient()
    const { error } = await supabase.from('destination_items').insert({
      destination_id: destinationId,
      category,
      name: name.trim(),
      price: price ? parseFloat(price) : null,
      rating: rating || null,
      notes: notesValue,
      url: url.trim() || null,
    })
    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast(`${meta.emoji} Aggiunto!`)
      reset(); onCreated(); onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Aggiungi ${meta.label}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>Nome *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={isHotel ? 'Nome struttura' : `Nome ${meta.label.toLowerCase()}`}
            required className={INPUT} />
        </div>

        {/* Hotel-specific date fields */}
        {isHotel && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={LABEL}>Check-in</label>
                <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Check-out</label>
                <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} className={INPUT} />
              </div>
            </div>
            {nights !== null && (
              <p className="text-aqua text-xs -mt-2">{nights} nott{nights === 1 ? 'e' : 'i'}</p>
            )}
            <div>
              <label className={LABEL}>Indirizzo</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Via Roma 1, Lisbona" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Tipo camera</label>
              <input value={roomType} onChange={e => setRoomType(e.target.value)}
                placeholder="Camera doppia, Suite…" className={INPUT} />
            </div>
          </>
        )}

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className={LABEL}>Prezzo (€)</label>
            <input type="number" min="0" step="0.01" value={price}
              onChange={e => setPrice(e.target.value)} placeholder={isHotel ? 'Totale soggiorno' : '0.00'} className={INPUT} />
          </div>
          {!isHotel && (
            <div>
              <label className={LABEL}>Valutazione</label>
              <div className="flex gap-1 pb-3">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)}
                    className={`text-xl transition-colors ${n <= rating ? 'text-yellow-400' : 'text-white/15 hover:text-yellow-400/50'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={LABEL}>{isHotel ? 'Link prenotazione' : 'URL'}</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className={INPUT} />
        </div>

        {!isHotel && (
          <div>
            <label className={LABEL}>Note</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Note aggiuntive…" rows={2} className={INPUT + ' resize-none'} />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => { reset(); onClose() }}>Annulla</Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvataggio…' : 'Aggiungi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
