'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Destination, DestinationItem, DestinationStub,
  Category, ItemStatus,
  CATEGORY_META, SECTION_ORDER, formatPeriod,
} from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { ItemCard } from '@/components/items/ItemCard'
import { FlightCard } from '@/components/items/FlightCard'
import { AddItemModal } from '@/components/items/AddItemModal'
import { AddFlightModal } from '@/components/items/AddFlightModal'
import { AddDestinationModal } from './AddDestinationModal'
import { StatusBar } from './StatusBar'
import { BudgetTracker } from './BudgetTracker'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { DestinationTabNav } from './DestinationTabNav'
import { ShareButtonClient } from '@/app/destinations/[id]/ShareButtonClient'
import { useToast } from '@/components/ui/Toast'

interface TripDashboardProps {
  dest: Destination
  initialItems: DestinationItem[]
  prevDest: DestinationStub | null
  nextDest: DestinationStub | null
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  color: 'rgba(255,255,255,0.9)',
  fontSize: 14,
}

function QuickNote({ destinationId, category, onSaved }: {
  destinationId: string; category: Category; onSaved: (item: DestinationItem) => void
}) {
  const [text, setText] = useState('')
  const { toast } = useToast()

  const handleBlur = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const supabase = createClient()
    const { data, error } = await supabase.from('destination_items').insert({
      destination_id: destinationId, category,
      name: trimmed.slice(0, 50),
      notes: trimmed.length > 50 ? trimmed : null,
      status: 'idea' as ItemStatus, price: null, rating: null, url: null,
    }).select().single()
    if (data) { onSaved(data); setText('') }
    else if (error) toast(error.message, 'error')
  }

  return (
    <textarea
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={handleBlur}
      placeholder="Nota veloce…"
      rows={2}
      className="w-full text-sm resize-none focus:outline-none transition-all duration-200"
      style={{
        ...INPUT_STYLE,
        padding: '10px 14px',
        color: 'rgba(255,255,255,0.75)',
      }}
      onFocus={e => { (e.target as HTMLTextAreaElement).style.border = '1px solid rgba(255,107,74,0.45)'; (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(255,107,74,0.12)' }}
      onBlurCapture={e => { (e.target as HTMLTextAreaElement).style.border = '1px solid rgba(255,255,255,0.10)'; (e.target as HTMLTextAreaElement).style.boxShadow = '' }}
    />
  )
}

function ConfirmBanner({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="px-4 py-2 rounded-xl text-xs flex items-center justify-between mb-2"
      style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.25)', color: 'rgba(255,180,180,0.9)' }}>
      <span>Clicca Elimina di nuovo per confermare</span>
      <button onClick={onCancel} className="hover:opacity-80 transition-opacity">Annulla</button>
    </div>
  )
}

export function TripDashboard({ dest, initialItems, prevDest, nextDest }: TripDashboardProps) {
  const [items, setItems] = useState<DestinationItem[]>(initialItems)
  const [openSections, setOpenSections] = useState<Set<Category>>(new Set(['voli']))
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [addCategory, setAddCategory] = useState<Category | null>(null)
  const [flightModalOpen, setFlightModalOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<DestinationItem | undefined>()
  const [showEditDest, setShowEditDest] = useState(false)
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const period = formatPeriod(dest.date_from, dest.period_note)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === 'ArrowLeft'  && prevDest) { e.preventDefault(); router.push(`/destinations/${prevDest.id}`) }
      if (e.key === 'ArrowRight' && nextDest) { e.preventDefault(); router.push(`/destinations/${nextDest.id}`) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevDest, nextDest, router])

  const toggleSection = (cat: Category) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      return next
    })
  }

  const handleStatusChange = useCallback((id: string, status: ItemStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }, [])

  const handleDeleteRequest = async (id: string) => {
    if (pendingDelete !== id) {
      setPendingDelete(id)
      if (deleteTimer.current) clearTimeout(deleteTimer.current)
      deleteTimer.current = setTimeout(() => setPendingDelete(null), 3000)
      return
    }
    setPendingDelete(null)
    setItems(prev => prev.filter(i => i.id !== id))
    const supabase = createClient()
    const { error } = await supabase.from('destination_items').delete().eq('id', id)
    if (error) toast(error.message, 'error')
    else toast('Eliminato', 'info')
  }

  const refetchCategory = async (cat: Category) => {
    const supabase = createClient()
    const { data } = await supabase.from('destination_items').select('*')
      .eq('destination_id', dest.id).eq('category', cat).order('created_at', { ascending: false })
    if (data) setItems(prev => [...prev.filter(i => i.category !== cat), ...data])
  }

  const getCatItems = (cat: Category) => items.filter(i => i.category === cat)

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 glass-nav">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => prevDest && router.push(`/destinations/${prevDest.id}`)}
            disabled={!prevDest}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-20 hover:bg-white/8"
            title={prevDest ? `← ${prevDest.emoji} ${prevDest.name}` : undefined}
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Breadcrumb items={[{ label: 'WanderPlan', href: '/' }, { label: `${dest.emoji} ${dest.name}` }]} />
              <button onClick={() => setShowEditDest(true)}
                className="transition-opacity hover:opacity-100 text-xs"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                ✎
              </button>
            </div>
            {(period || dest.budget) && (
              <div className="flex items-center gap-3 mt-0.5">
                {period && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{period}</span>}
                {dest.budget && (
                  <span className="text-xs">
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Budget </span>
                    <span style={{ color: '#4ECBA0', fontFamily: 'monospace', fontWeight: 600 }}>€{Number(dest.budget).toFixed(0)}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => nextDest && router.push(`/destinations/${nextDest.id}`)}
            disabled={!nextDest}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-20 hover:bg-white/8"
            title={nextDest ? `${nextDest.emoji} ${nextDest.name} →` : undefined}
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>

          <ShareButtonClient destinationId={dest.id} />
        </div>

        <DestinationTabNav destId={dest.id} />
        <StatusBar items={items} budget={dest.budget} />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-3">
        {SECTION_ORDER.map(cat => {
          const meta = CATEGORY_META[cat]
          const catItems = getCatItems(cat)
          const isOpen = openSections.has(cat)
          const catSpend = catItems.reduce((s, i) => s + (i.price ?? 0), 0)
          const flightItem = cat === 'voli' ? catItems[0] : undefined

          return (
            <div key={cat} className="glass overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(cat)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-150 hover:bg-white/3"
              >
                <CategoryIcon category={cat} size={16} style={{ color: meta.color, flexShrink: 0 }} />
                <span className="font-medium flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.90)' }}>{meta.label}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {catItems.length > 0 && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {catItems.length} item{catItems.length > 1 ? 's' : ''}
                      {catSpend > 0 && ` · €${catSpend.toFixed(0)}`}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {cat === 'voli' ? (
                    <>
                      {flightItem ? (
                        <>
                          {pendingDelete === flightItem.id && <ConfirmBanner onCancel={() => setPendingDelete(null)} />}
                          <FlightCard item={flightItem} onDelete={handleDeleteRequest}
                            onEdit={() => { setEditingFlight(flightItem); setFlightModalOpen(true) }}
                            onStatusChange={handleStatusChange} />
                          <button onClick={() => { setEditingFlight(flightItem); setFlightModalOpen(true) }}
                            className="text-xs self-start transition-opacity hover:opacity-80"
                            style={{ color: 'rgba(255,255,255,0.32)' }}>
                            Modifica voli →
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setEditingFlight(undefined); setFlightModalOpen(true) }}
                          className="text-sm py-6 w-full rounded-xl transition-all duration-150"
                          style={{ color: 'rgba(255,255,255,0.35)', border: '1px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px dashed rgba(255,107,74,0.35)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,107,74,0.7)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px dashed rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
                        >
                          + Configura voli
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {catItems.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2">
                          {catItems.map(item => (
                            <div key={item.id}>
                              {pendingDelete === item.id && <ConfirmBanner onCancel={() => setPendingDelete(null)} />}
                              <ItemCard item={item} onDelete={handleDeleteRequest} onStatusChange={handleStatusChange} />
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setAddCategory(cat)}
                        className="text-xs self-start mt-1 transition-opacity hover:opacity-80"
                        style={{ color: 'rgba(255,255,255,0.30)' }}>
                        + Aggiungi {meta.label.toLowerCase()}
                      </button>
                      <QuickNote destinationId={dest.id} category={cat} onSaved={item => setItems(prev => [item, ...prev])} />
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <BudgetTracker items={items} budget={dest.budget} />
      </div>

      {/* Modals */}
      <AddFlightModal open={flightModalOpen} onClose={() => setFlightModalOpen(false)}
        onSaved={() => refetchCategory('voli')} destinationId={dest.id} existingItem={editingFlight} />
      {addCategory && addCategory !== 'voli' && (
        <AddItemModal open onClose={() => setAddCategory(null)}
          onCreated={() => { refetchCategory(addCategory); setAddCategory(null) }}
          destinationId={dest.id} category={addCategory} />
      )}
      <AddDestinationModal open={showEditDest} onClose={() => setShowEditDest(false)}
        onCreated={() => { setShowEditDest(false); router.refresh() }}
        onDeleted={() => router.push('/')} existingDestination={dest} />
    </div>
  )
}
