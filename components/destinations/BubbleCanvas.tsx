'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Destination } from '@/lib/types'
import { DestinationBubble } from './DestinationBubble'
import { AddDestinationModal } from './AddDestinationModal'
import { AuthModal } from '@/components/auth/AuthModal'

interface BubbleCanvasProps {
  initialDestinations: (Destination & { item_count: number })[]
  userId: string | null
}

export function BubbleCanvas({ initialDestinations, userId }: BubbleCanvasProps) {
  const [destinations, setDestinations] = useState(initialDestinations)
  const [showAdd, setShowAdd] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [editingDest, setEditingDest] = useState<Destination | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const router = useRouter()

  const refresh = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('destinations').select('*, destination_items(count)').order('created_at', { ascending: false })
    if (data) {
      setDestinations(data.map((d: Destination & { destination_items: { count: number }[] }) => ({
        ...d, item_count: d.destination_items?.[0]?.count ?? 0,
      })))
    }
  }

  const handleDragStart = useCallback((e: React.PointerEvent, dest: Destination & { item_count: number }) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left - (dest.pos_x / 100) * rect.width,
      y: e.clientY - rect.top  - (dest.pos_y / 100) * rect.height,
    }
    setDraggingId(dest.id)

    const onMove = (ev: PointerEvent) => {
      const newX = Math.max(5, Math.min(95, ((ev.clientX - rect.left - dragOffset.current.x) / rect.width)  * 100))
      const newY = Math.max(5, Math.min(95, ((ev.clientY - rect.top  - dragOffset.current.y) / rect.height) * 100))
      setDestinations(prev => prev.map(d => d.id === dest.id ? { ...d, pos_x: newX, pos_y: newY } : d))
    }
    const onUp = async (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setDraggingId(null)
      const newX = Math.max(5, Math.min(95, ((ev.clientX - rect.left - dragOffset.current.x) / rect.width)  * 100))
      const newY = Math.max(5, Math.min(95, ((ev.clientY - rect.top  - dragOffset.current.y) / rect.height) * 100))
      const supabase = createClient()
      await supabase.from('destinations').update({ pos_x: newX, pos_y: newY }).eq('id', dest.id)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="relative w-full h-screen overflow-hidden select-none">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 glass-nav">
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif', fontWeight: 300, fontSize: 20, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.3px' }}>
            wander<span style={{ color: '#FF6B4A' }}>·</span>plan
          </span>
        </div>
        <div className="flex items-center gap-4">
          {destinations.length > 0 && (
            <a href="/compare" className="text-sm transition-all duration-150 hover:text-white/90" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Confronta
            </a>
          )}
          {userId ? (
            <button onClick={handleLogout} className="text-sm transition-all" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Esci
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-sm font-medium transition-all hover:opacity-90" style={{ color: '#FF6B4A' }}>
              Accedi
            </button>
          )}
        </div>
      </header>

      {/* Canvas */}
      <div ref={canvasRef} className="absolute inset-0">
        {destinations.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
            <span className="text-6xl" style={{ opacity: 0.08 }}>🗺️</span>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Nessuna destinazione</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Clicca + per aggiungerne una</p>
          </div>
        )}
        {destinations.map(dest => (
          <DestinationBubble
            key={dest.id}
            destination={dest}
            itemCount={dest.item_count}
            onClick={() => { if (!draggingId) router.push(`/destinations/${dest.id}`) }}
            onDragStart={e => handleDragStart(e, dest)}
            onEdit={() => setEditingDest(dest)}
            isDragging={draggingId === dest.id}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => userId ? setShowAdd(true) : setShowAuth(true)}
        className="absolute bottom-8 right-8 z-30 w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all duration-150"
        style={{
          background: 'rgba(255, 107, 74, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 74, 0.45)',
          boxShadow: '0 8px 32px rgba(255, 107, 74, 0.35)',
        }}
        aria-label="Aggiungi destinazione"
      >
        <Plus size={20} strokeWidth={1.5} color="white" />
      </button>

      <AddDestinationModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={refresh} />
      <AddDestinationModal
        open={!!editingDest}
        onClose={() => setEditingDest(null)}
        onCreated={refresh}
        onDeleted={() => { setEditingDest(null); refresh() }}
        existingDestination={editingDest ?? undefined}
      />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
