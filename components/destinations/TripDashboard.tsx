'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Destination, DestinationItem, DestinationStub,
  Category, ItemStatus,
  CATEGORY_META, SECTION_ORDER, formatPeriod,
} from '@/lib/types'
import { ItemCard } from '@/components/items/ItemCard'
import { FlightCard } from '@/components/items/FlightCard'
import { AddItemModal } from '@/components/items/AddItemModal'
import { AddFlightModal } from '@/components/items/AddFlightModal'
import { StatusBar } from './StatusBar'
import { BudgetTracker } from './BudgetTracker'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { ShareButtonClient } from '@/app/destinations/[id]/ShareButtonClient'
import { useToast } from '@/components/ui/Toast'

interface TripDashboardProps {
  dest: Destination
  initialItems: DestinationItem[]
  prevDest: DestinationStub | null
  nextDest: DestinationStub | null
}

function QuickNote({
  destinationId,
  category,
  onSaved,
}: {
  destinationId: string
  category: Category
  onSaved: (item: DestinationItem) => void
}) {
  const [text, setText] = useState('')
  const { toast } = useToast()

  const handleBlur = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('destination_items')
      .insert({
        destination_id: destinationId,
        category,
        name: trimmed.slice(0, 50),
        notes: trimmed.length > 50 ? trimmed : null,
        status: 'idea' as ItemStatus,
        price: null,
        rating: null,
        url: null,
      })
      .select()
      .single()
    if (data) { onSaved(data); setText('') }
    else if (error) toast(error.message, 'error')
  }

  return (
    <textarea
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={handleBlur}
      placeholder="Aggiungi una nota veloce…"
      rows={2}
      className="w-full bg-[#0D1B2A] rounded-xl px-4 py-2.5 text-sand placeholder-[#6B8FA8]/40 text-sm focus:outline-none ring-1 ring-white/5 focus:ring-coral/40 transition-all resize-none"
    />
  )
}

export function TripDashboard({ dest, initialItems, prevDest, nextDest }: TripDashboardProps) {
  const [items, setItems] = useState<DestinationItem[]>(initialItems)
  const [openSections, setOpenSections] = useState<Set<Category>>(new Set(['voli']))
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [addCategory, setAddCategory] = useState<Category | null>(null)
  const [flightModalOpen, setFlightModalOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<DestinationItem | undefined>()
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const period = formatPeriod(dest.date_from, dest.period_note)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === 'ArrowLeft' && prevDest) { e.preventDefault(); router.push(`/destinations/${prevDest.id}`) }
      if (e.key === 'ArrowRight' && nextDest) { e.preventDefault(); router.push(`/destinations/${nextDest.id}`) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevDest, nextDest, router])

  const toggleSection = (cat: Category) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
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
    if (error) { toast(error.message, 'error'); }
    else { toast('Eliminato', 'info') }
  }

  const refetchCategory = async (cat: Category) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('destination_items').select('*')
      .eq('destination_id', dest.id).eq('category', cat)
      .order('created_at', { ascending: false })
    if (data) {
      setItems(prev => [...prev.filter(i => i.category !== cat), ...data])
    }
  }

  const handleQuickNote = (item: DestinationItem) => {
    setItems(prev => [item, ...prev])
  }

  const getCatItems = (cat: Category) =>
    items.filter(i => i.category === cat)

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0D1B2A]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Prev */}
          <button
            onClick={() => prevDest && router.push(`/destinations/${prevDest.id}`)}
            disabled={!prevDest}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B8FA8] hover:text-sand hover:bg-white/5 transition-all disabled:opacity-20 shrink-0"
            title={prevDest ? `← ${prevDest.emoji} ${prevDest.name}` : undefined}
          >
            ‹
          </button>

          {/* Center */}
          <div className="flex-1 min-w-0">
            <Breadcrumb items={[
              { label: 'WanderPlan', href: '/' },
              { label: `${dest.emoji} ${dest.name}` },
            ]} />
            {(period || dest.budget) && (
              <div className="flex items-center gap-3 mt-0.5">
                {period && <span className="text-[#6B8FA8] text-xs">{period}</span>}
                {dest.budget && (
                  <span className="text-[#6B8FA8] text-xs">
                    Budget <span className="text-aqua font-mono">€{Number(dest.budget).toFixed(0)}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Next */}
          <button
            onClick={() => nextDest && router.push(`/destinations/${nextDest.id}`)}
            disabled={!nextDest}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B8FA8] hover:text-sand hover:bg-white/5 transition-all disabled:opacity-20 shrink-0"
            title={nextDest ? `${nextDest.emoji} ${nextDest.name} →` : undefined}
          >
            ›
          </button>

          <ShareButtonClient destinationId={dest.id} />
        </div>

        {/* Status bar */}
        <StatusBar items={items} budget={dest.budget} />
      </div>

      {/* Sections */}
      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-3">
        {SECTION_ORDER.map(cat => {
          const meta = CATEGORY_META[cat]
          const catItems = getCatItems(cat)
          const isOpen = openSections.has(cat)
          const catSpend = catItems.reduce((s, i) => s + (i.price ?? 0), 0)
          const flightItem = cat === 'voli' ? catItems[0] : undefined

          return (
            <div key={cat} className="bg-[#111e2d] rounded-2xl overflow-hidden border border-white/5">
              {/* Section header */}
              <button
                onClick={() => toggleSection(cat)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/3 transition-colors text-left"
              >
                <span className="text-lg shrink-0">{meta.emoji}</span>
                <span className="text-sand font-medium flex-1">{meta.label}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {catItems.length > 0 && (
                    <span className="text-[#6B8FA8] text-xs">
                      {catItems.length} element{catItems.length === 1 ? 'o' : 'i'}
                      {catSpend > 0 && ` · €${catSpend.toFixed(0)}`}
                    </span>
                  )}
                  {!isOpen && cat !== 'voli' && (
                    <button
                      onClick={e => { e.stopPropagation(); toggleSection(cat); setAddCategory(cat) }}
                      className="text-[#6B8FA8] hover:text-sand text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      +
                    </button>
                  )}
                  <span className="text-[#6B8FA8] text-xs">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Section body */}
              {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {/* Items */}
                  {cat === 'voli' ? (
                    <>
                      {flightItem ? (
                        <>
                          {pendingDelete === flightItem.id && (
                            <ConfirmBanner onCancel={() => setPendingDelete(null)} />
                          )}
                          <FlightCard
                            item={flightItem}
                            onDelete={handleDeleteRequest}
                            onEdit={() => { setEditingFlight(flightItem); setFlightModalOpen(true) }}
                            onStatusChange={handleStatusChange}
                          />
                        </>
                      ) : (
                        <button
                          onClick={() => { setEditingFlight(undefined); setFlightModalOpen(true) }}
                          className="text-[#6B8FA8] hover:text-sand text-sm py-6 w-full border border-dashed border-white/10 rounded-xl hover:border-white/20 transition-colors"
                        >
                          + Configura voli
                        </button>
                      )}
                      {flightItem && (
                        <button
                          onClick={() => { setEditingFlight(flightItem); setFlightModalOpen(true) }}
                          className="text-[#6B8FA8] hover:text-sand text-xs self-start transition-colors"
                        >
                          Modifica voli →
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {catItems.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {catItems.map(item => (
                            <div key={item.id}>
                              {pendingDelete === item.id && (
                                <ConfirmBanner onCancel={() => setPendingDelete(null)} />
                              )}
                              <ItemCard
                                item={item}
                                onDelete={handleDeleteRequest}
                                onStatusChange={handleStatusChange}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setAddCategory(cat)}
                        className="text-[#6B8FA8] hover:text-sand text-xs self-start transition-colors"
                      >
                        + Aggiungi {meta.label.toLowerCase()}
                      </button>
                      <QuickNote
                        destinationId={dest.id}
                        category={cat}
                        onSaved={handleQuickNote}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Budget tracker */}
        <BudgetTracker items={items} budget={dest.budget} />
      </div>

      {/* Modals */}
      <AddFlightModal
        open={flightModalOpen}
        onClose={() => setFlightModalOpen(false)}
        onSaved={() => refetchCategory('voli')}
        destinationId={dest.id}
        existingItem={editingFlight}
      />
      {addCategory && addCategory !== 'voli' && (
        <AddItemModal
          open
          onClose={() => setAddCategory(null)}
          onCreated={() => { refetchCategory(addCategory); setAddCategory(null) }}
          destinationId={dest.id}
          category={addCategory}
        />
      )}
    </div>
  )
}

function ConfirmBanner({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="px-4 py-2 bg-red-950/40 rounded-xl text-red-300 text-xs flex items-center justify-between">
      <span>Clicca Elimina di nuovo per confermare</span>
      <button onClick={onCancel} className="text-red-300/50 hover:text-red-300 transition-colors">Annulla</button>
    </div>
  )
}
