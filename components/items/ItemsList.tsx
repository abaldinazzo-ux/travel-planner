'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category, DestinationItem, CATEGORY_META } from '@/lib/types'
import { ItemCard } from './ItemCard'
import { AddItemModal } from './AddItemModal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface ItemsListProps {
  initialItems: DestinationItem[]
  destinationId: string
  category: Category
  readonly?: boolean
}

export function ItemsList({ initialItems, destinationId, category, readonly }: ItemsListProps) {
  const [items, setItems] = useState(initialItems)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const meta = CATEGORY_META[category]

  const totalPrice = items.reduce((sum, i) => sum + (i.price ?? 0), 0)

  const refresh = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('destination_items')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('category', category)
      .order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('destination_items').delete().eq('id', id)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Elemento eliminato', 'info')
      setItems(prev => prev.filter(i => i.id !== id))
      setConfirmDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <h2 className="text-sand font-semibold">{meta.label}</h2>
            {totalPrice > 0 && (
              <p className="text-aqua text-sm">Totale: €{totalPrice.toFixed(2)}</p>
            )}
          </div>
        </div>
        {!readonly && (
          <Button onClick={() => setShowAdd(true)} size="sm">
            + Aggiungi
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <span className="text-4xl opacity-30">{meta.emoji}</span>
          <p className="text-sand/40">Nessun elemento in questa categoria</p>
          {!readonly && (
            <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
              Aggiungi il primo
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id}>
              {confirmDelete === item.id && (
                <div className="mb-1 px-3 py-1.5 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-xs flex items-center justify-between">
                  <span>Clicca di nuovo ✕ per confermare l&apos;eliminazione</span>
                  <button onClick={() => setConfirmDelete(null)} className="text-red-300/60 hover:text-red-300">
                    Annulla
                  </button>
                </div>
              )}
              <ItemCard item={item} onDelete={handleDelete} readonly={readonly} />
            </div>
          ))}
        </div>
      )}

      {!readonly && (
        <AddItemModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onCreated={refresh}
          destinationId={destinationId}
          category={category}
        />
      )}
    </div>
  )
}
