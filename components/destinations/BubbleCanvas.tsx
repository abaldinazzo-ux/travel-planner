'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Destination } from '@/lib/types'
import { DestinationBubble } from './DestinationBubble'
import { AddDestinationModal } from './AddDestinationModal'
import { AuthModal } from '@/components/auth/AuthModal'
import { useToast } from '@/components/ui/Toast'

interface BubbleCanvasProps {
  initialDestinations: (Destination & { item_count: number })[]
  userId: string | null
}

export function BubbleCanvas({ initialDestinations, userId }: BubbleCanvasProps) {
  const [destinations, setDestinations] = useState(initialDestinations)
  const [showAdd, setShowAdd] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const router = useRouter()
  const { toast } = useToast()

  const refresh = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('destinations')
      .select('*, destination_items(count)')
      .order('created_at', { ascending: false })

    if (data) {
      setDestinations(
        data.map((d: Destination & { destination_items: { count: number }[] }) => ({
          ...d,
          item_count: d.destination_items?.[0]?.count ?? 0,
        }))
      )
    }
  }

  const handleDragStart = useCallback(
    (e: React.PointerEvent, dest: Destination & { item_count: number }) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const currentLeft = (dest.pos_x / 100) * rect.width
      const currentTop = (dest.pos_y / 100) * rect.height
      dragOffset.current = {
        x: e.clientX - rect.left - currentLeft,
        y: e.clientY - rect.top - currentTop,
      }
      setDraggingId(dest.id)

      const onMove = (ev: PointerEvent) => {
        const newX = Math.max(5, Math.min(95, ((ev.clientX - rect.left - dragOffset.current.x) / rect.width) * 100))
        const newY = Math.max(5, Math.min(95, ((ev.clientY - rect.top - dragOffset.current.y) / rect.height) * 100))
        setDestinations(prev =>
          prev.map(d => d.id === dest.id ? { ...d, pos_x: newX, pos_y: newY } : d)
        )
      }

      const onUp = async (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        setDraggingId(null)

        const newX = Math.max(5, Math.min(95, ((ev.clientX - rect.left - dragOffset.current.x) / rect.width) * 100))
        const newY = Math.max(5, Math.min(95, ((ev.clientY - rect.top - dragOffset.current.y) / rect.height) * 100))

        const supabase = createClient()
        await supabase
          .from('destinations')
          .update({ pos_x: newX, pos_y: newY })
          .eq('id', dest.id)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    []
  )

  const handleBubbleClick = (dest: Destination) => {
    if (draggingId) return
    router.push(`/destinations/${dest.id}`)
  }

  const handleAddClick = () => {
    if (!userId) { setShowAuth(true); return }
    setShowAdd(true)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-navy select-none">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="text-sand font-bold text-xl tracking-tight">WanderPlan</span>
        </div>
        <div className="flex items-center gap-3">
          {destinations.length > 0 && (
            <a
              href="/compare"
              className="text-sand/60 hover:text-sand text-sm transition-colors"
            >
              Confronta
            </a>
          )}
          {userId ? (
            <button
              onClick={handleLogout}
              className="text-sand/40 hover:text-sand/70 text-sm transition-colors"
            >
              Esci
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-coral hover:text-coral/80 text-sm font-medium transition-colors"
            >
              Accedi
            </button>
          )}
        </div>
      </header>

      {/* Canvas */}
      <div ref={canvasRef} className="absolute inset-0">
        {destinations.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center pointer-events-none">
            <span className="text-6xl opacity-30">🗺️</span>
            <p className="text-sand/40 text-lg">Nessuna destinazione ancora</p>
            <p className="text-sand/30 text-sm">Clicca il + per aggiungerne una</p>
          </div>
        )}

        {destinations.map(dest => (
          <DestinationBubble
            key={dest.id}
            destination={dest}
            itemCount={dest.item_count}
            onClick={() => handleBubbleClick(dest)}
            onDragStart={e => handleDragStart(e, dest)}
            isDragging={draggingId === dest.id}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={handleAddClick}
        className="absolute bottom-8 right-8 z-30 w-14 h-14 rounded-full bg-coral text-white text-2xl flex items-center justify-center shadow-lg hover:bg-coral/90 active:scale-95 transition-all duration-200"
        aria-label="Aggiungi destinazione"
      >
        +
      </button>

      <AddDestinationModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={refresh}
      />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
