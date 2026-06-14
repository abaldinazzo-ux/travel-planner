'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { DestinationItem, FlightData, FlightLeg } from '@/lib/types'

interface AddFlightModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  destinationId: string
  existingItem?: DestinationItem
}

const emptyLeg = (): Partial<FlightLeg> => ({
  date: '', time: '', from: '', to: '', airline: '', price: '', url: '',
})

function parseLeg(data: FlightData | null, key: 'outbound' | 'return'): Partial<FlightLeg> {
  return { ...emptyLeg(), ...(data?.[key] ?? {}) }
}

function parseExisting(item: DestinationItem | undefined): FlightData | null {
  if (!item?.notes) return null
  try { return JSON.parse(item.notes) } catch { return null }
}

const INPUT = 'bg-[#0D1B2A] rounded-xl px-3 py-2.5 text-sand placeholder-sand/20 focus:outline-none ring-1 ring-white/8 focus:ring-coral/50 transition-all w-full text-sm'
const LABEL = 'text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest mb-1.5 block'

function LegForm({
  leg, update, title,
}: {
  leg: Partial<FlightLeg>
  update: (f: keyof FlightLeg, v: string) => void
  title: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sand/50 text-xs font-semibold uppercase tracking-wider">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={LABEL}>Aeroporto partenza</label>
          <input value={leg.from ?? ''} onChange={e => update('from', e.target.value)}
            placeholder="VCE - Venezia Marco Polo" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Aeroporto arrivo</label>
          <input value={leg.to ?? ''} onChange={e => update('to', e.target.value)}
            placeholder="LIS - Lisbona" className={INPUT} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={LABEL}>Data</label>
          <input type="date" value={leg.date ?? ''} onChange={e => update('date', e.target.value)}
            className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Ora</label>
          <input type="time" value={leg.time ?? ''} onChange={e => update('time', e.target.value)}
            className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Prezzo (€)</label>
          <input type="number" min="0" step="0.01" value={leg.price ?? ''}
            onChange={e => update('price', e.target.value)} placeholder="0" className={INPUT} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={LABEL}>Compagnia</label>
          <input value={leg.airline ?? ''} onChange={e => update('airline', e.target.value)}
            placeholder="Ryanair, EasyJet…" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Link prenotazione</label>
          <input type="url" value={leg.url ?? ''} onChange={e => update('url', e.target.value)}
            placeholder="https://…" className={INPUT} />
        </div>
      </div>
    </div>
  )
}

export function AddFlightModal({ open, onClose, onSaved, destinationId, existingItem }: AddFlightModalProps) {
  const existing = parseExisting(existingItem)
  const [outbound, setOutbound] = useState<Partial<FlightLeg>>(parseLeg(existing, 'outbound'))
  const [ret, setRet] = useState<Partial<FlightLeg>>(parseLeg(existing, 'return'))
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const isEdit = !!existingItem

  const updateOut = (f: keyof FlightLeg, v: string) => setOutbound(p => ({ ...p, [f]: v }))
  const updateRet = (f: keyof FlightLeg, v: string) => setRet(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const flightData: FlightData = { outbound, return: ret }
    const total = (parseFloat(outbound.price || '0') || 0) + (parseFloat(ret.price || '0') || 0)
    const route = outbound.from && outbound.to
      ? `${outbound.from.split(' - ')[0].trim()} → ${outbound.to.split(' - ')[0].trim()}`
      : 'Volo'

    const payload = {
      destination_id: destinationId,
      category: 'voli' as const,
      name: route,
      price: total || null,
      rating: null,
      notes: JSON.stringify(flightData),
      url: null,
    }

    const supabase = createClient()
    const { error } = isEdit
      ? await supabase.from('destination_items').update(payload).eq('id', existingItem.id)
      : await supabase.from('destination_items').insert(payload)

    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast(isEdit ? 'Voli aggiornati ✈️' : 'Voli salvati ✈️')
      onSaved()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modifica voli' : 'Aggiungi voli'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <LegForm leg={outbound} update={updateOut} title="Volo andata" />
        <div className="border-t border-white/5" />
        <LegForm leg={ret} update={updateRet} title="Volo ritorno" />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Annulla</Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvataggio…' : isEdit ? 'Aggiorna' : 'Salva voli'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
