'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Category, CATEGORY_META, ItemStatus, DestinationStub } from '@/lib/types'

interface QuickCaptureModalProps {
  open: boolean
  onClose: () => void
}

const CATEGORIES: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

function isUrl(text: string): boolean {
  return /^https?:\/\/.+/.test(text.trim())
}

function detectCategory(urlString: string): Category {
  try {
    const h = new URL(urlString).hostname.toLowerCase()
    if (h.includes('booking.com') || h.includes('airbnb')) return 'hotel'
    if (h.includes('ryanair') || h.includes('easyjet') || h.includes('ita-airways') || h.includes('skyscanner')) return 'voli'
    if (h.includes('tripadvisor')) return 'ristoranti'
    if (h.includes('maps.google') || h.includes('maps.app.goo')) return 'attivita'
  } catch { /* not a valid url */ }
  return 'note'
}

function siteLabel(urlString: string): string {
  try {
    const h = new URL(urlString).hostname.replace('www.', '')
    const known: Record<string, string> = {
      'booking.com': 'Booking.com', 'airbnb.it': 'Airbnb', 'airbnb.com': 'Airbnb',
      'ryanair.com': 'Ryanair', 'easyjet.com': 'EasyJet', 'ita-airways.com': 'ITA Airways',
      'skyscanner.it': 'Skyscanner', 'skyscanner.net': 'Skyscanner',
      'tripadvisor.it': 'TripAdvisor', 'tripadvisor.com': 'TripAdvisor',
    }
    return known[h] ?? h.split('.')[0]
  } catch { return 'Link' }
}

export function QuickCaptureModal({ open, onClose }: QuickCaptureModalProps) {
  const [input, setInput] = useState('')
  const [destinations, setDestinations] = useState<DestinationStub[]>([])
  const [selectedDestId, setSelectedDestId] = useState('')
  const [category, setCategory] = useState<Category>('note')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const inputIsUrl = isUrl(input)
  const detectedCategory = inputIsUrl ? detectCategory(input) : null

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 50)
    const supabase = createClient()
    supabase.from('destinations').select('id, name, emoji')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const dests = (data ?? []) as DestinationStub[]
        setDestinations(dests)
        if (dests.length > 0 && !selectedDestId) setSelectedDestId(dests[0].id)
      })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (detectedCategory) setCategory(detectedCategory)
  }, [detectedCategory])

  const handleClose = () => {
    setInput('')
    onClose()
  }

  const handleSave = async () => {
    if (!input.trim() || !selectedDestId) return
    setLoading(true)
    const supabase = createClient()

    let name = input.trim().slice(0, 100)
    let url: string | null = null
    let notes: string | null = null
    const status: ItemStatus = inputIsUrl ? 'found' : 'idea'

    if (inputIsUrl) {
      url = input.trim()
      const label = siteLabel(url)
      name = `${label} - da rinominare`
      if (category === 'voli') {
        notes = JSON.stringify({ outbound: { url }, return: {} })
      }
    }

    const { error } = await supabase.from('destination_items').insert({
      destination_id: selectedDestId,
      category,
      name,
      url,
      notes,
      status,
      price: null,
      rating: null,
    })

    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      const dest = destinations.find(d => d.id === selectedDestId)
      const meta = CATEGORY_META[category]
      toast(`Salvato in ${dest?.name ?? '…'} → ${meta.label}`)
      handleClose()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick Capture" maxWidth="max-w-lg">
      <div className="flex flex-col gap-4">
        {/* Main input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave() }}
          placeholder="Incolla un URL o scrivi un'idea…"
          rows={3}
          className="bg-[#0D1B2A] rounded-xl px-4 py-3 text-sand placeholder-sand/20 focus:outline-none ring-1 ring-white/8 focus:ring-coral/50 transition-all w-full text-sm resize-none"
        />

        {/* URL hint */}
        {inputIsUrl && detectedCategory && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D1B2A] rounded-lg text-xs text-[#6B8FA8]">
            <span>🔗</span>
            <span>Rilevato: <strong className="text-sand">{siteLabel(input)}</strong> → categoria <strong className="text-sand">{CATEGORY_META[detectedCategory].label}</strong></span>
          </div>
        )}

        {/* Destination */}
        <div>
          <label className="text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest mb-1.5 block">
            Destinazione
          </label>
          {destinations.length === 0 ? (
            <p className="text-[#6B8FA8]/50 text-sm">Nessuna destinazione. <a href="/" className="text-coral underline">Creane una</a></p>
          ) : (
            <select
              value={selectedDestId}
              onChange={e => setSelectedDestId(e.target.value)}
              className="bg-[#0D1B2A] rounded-xl px-4 py-2.5 text-sand focus:outline-none ring-1 ring-white/8 focus:ring-coral/50 transition-all w-full text-sm"
            >
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-[#6B8FA8] text-[10px] font-semibold uppercase tracking-widest mb-1.5 block">
            Categoria
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => {
              const meta = CATEGORY_META[cat]
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-coral/80 text-white'
                      : 'bg-[#0D1B2A] text-[#6B8FA8] hover:text-sand hover:bg-[#1A2E42]'
                  }`}
                >
                  {meta.emoji} {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>Annulla</Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSave}
            disabled={loading || !input.trim() || !selectedDestId}
          >
            {loading ? 'Salvataggio…' : 'Salva →'}
          </Button>
        </div>
        <p className="text-[#6B8FA8]/40 text-xs text-center">⌘+Enter per salvare</p>
      </div>
    </Modal>
  )
}
