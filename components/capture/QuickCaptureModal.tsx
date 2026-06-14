'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { Category, CATEGORY_META, ItemStatus, DestinationStub } from '@/lib/types'

interface QuickCaptureModalProps {
  open: boolean
  onClose: () => void
}

const CATEGORIES: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

function isUrl(text: string): boolean { return /^https?:\/\/.+/.test(text.trim()) }

function detectCategory(url: string): Category {
  try {
    const h = new URL(url).hostname.toLowerCase()
    if (h.includes('booking.com') || h.includes('airbnb')) return 'hotel'
    if (h.includes('ryanair') || h.includes('easyjet') || h.includes('ita-airways') || h.includes('skyscanner')) return 'voli'
    if (h.includes('tripadvisor')) return 'ristoranti'
    if (h.includes('maps.google') || h.includes('maps.app.goo')) return 'attivita'
  } catch { /* invalid url */ }
  return 'note'
}

function siteLabel(url: string): string {
  try {
    const h = new URL(url).hostname.replace('www.', '')
    const known: Record<string, string> = { 'booking.com': 'Booking', 'airbnb.it': 'Airbnb', 'airbnb.com': 'Airbnb', 'ryanair.com': 'Ryanair', 'easyjet.com': 'EasyJet', 'skyscanner.it': 'Skyscanner', 'skyscanner.net': 'Skyscanner', 'tripadvisor.it': 'TripAdvisor', 'tripadvisor.com': 'TripAdvisor' }
    return known[h] ?? h.split('.')[0]
  } catch { return 'Link' }
}

const INPUT_BASE: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, color: 'rgba(255,255,255,0.9)', fontSize: 14, outline: 'none', transition: 'all 0.2s' }

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
    supabase.from('destinations').select('id, name, emoji').order('created_at', { ascending: false })
      .then(({ data }) => {
        const dests = (data ?? []) as DestinationStub[]
        setDestinations(dests)
        if (dests.length > 0 && !selectedDestId) setSelectedDestId(dests[0].id)
      })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (detectedCategory) setCategory(detectedCategory) }, [detectedCategory])

  const handleClose = () => { setInput(''); onClose() }

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
      name = `${siteLabel(url)} - da rinominare`
      if (category === 'voli') notes = JSON.stringify({ outbound: { url }, return: {} })
    }
    const { error } = await supabase.from('destination_items').insert({
      destination_id: selectedDestId, category, name, url, notes, status, price: null, rating: null,
    })
    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    const dest = destinations.find(d => d.id === selectedDestId)
    toast(`Salvato in ${dest?.name ?? '…'} → ${CATEGORY_META[category].label}`)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick Capture" maxWidth="max-w-lg">
      <div className="flex flex-col gap-4">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave() }}
          placeholder="Incolla un URL o scrivi un'idea…"
          rows={3}
          className="text-sm resize-none"
          style={{ ...INPUT_BASE, padding: '12px 14px', width: '100%' }}
          onFocus={e => { e.target.style.border = '1px solid rgba(255,107,74,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,74,0.12)' }}
          onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = '' }}
        />

        {inputIsUrl && detectedCategory && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: 'rgba(255,107,74,0.10)', border: '1px solid rgba(255,107,74,0.20)', color: 'rgba(255,255,255,0.65)' }}>
            <span>🔗</span>
            <span>
              Rilevato: <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{siteLabel(input)}</strong>
              {' → '}
              <strong style={{ color: '#FF6B4A' }}>{CATEGORY_META[detectedCategory].label}</strong>
            </span>
          </div>
        )}

        <div>
          <label style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>
            Destinazione
          </label>
          {destinations.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Nessuna destinazione.</p>
          ) : (
            <select value={selectedDestId} onChange={e => setSelectedDestId(e.target.value)}
              className="text-sm" style={{ ...INPUT_BASE, padding: '10px 14px', width: '100%' }}>
              {destinations.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
            </select>
          )}
        </div>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>
            Categoria
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => {
              const meta = CATEGORY_META[cat]
              const isActive = category === cat
              return (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={isActive
                    ? { background: 'rgba(255,107,74,0.20)', border: '1px solid rgba(255,107,74,0.40)', color: '#FF6B4A' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
                  <CategoryIcon category={cat} size={11} strokeWidth={2} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>Annulla</Button>
          <Button type="button" className="flex-1" onClick={handleSave}
            disabled={loading || !input.trim() || !selectedDestId}>
            {loading ? 'Salvataggio…' : 'Salva →'}
          </Button>
        </div>
        <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>⌘+Enter per salvare</p>
      </div>
    </Modal>
  )
}
