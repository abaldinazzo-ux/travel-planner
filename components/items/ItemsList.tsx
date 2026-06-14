'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category, DestinationItem, CATEGORY_META } from '@/lib/types'
import { ItemCard } from './ItemCard'
import { AddItemModal } from './AddItemModal'
import { FlightCard } from './FlightCard'
import { AddFlightModal } from './AddFlightModal'
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
  const [editingItem, setEditingItem] = useState<DestinationItem | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const meta = CATEGORY_META[category]
  const isVoli = category === 'voli'
  const flightItem = isVoli ? items[0] : undefined

  const totalPrice = items.reduce((s, i) => s + (i.price ?? 0), 0)

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
    if (pendingDelete !== id) {
      setPendingDelete(id)
      setTimeout(() => setPendingDelete(null), 3000)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('destination_items').delete().eq('id', id)
    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Eliminato', 'info')
      setItems(prev => prev.filter(i => i.id !== id))
      setPendingDelete(null)
    }
  }

  const openAdd = () => { setEditingItem(undefined); setShowAdd(true) }
  const openEdit = (item: DestinationItem) => { setEditingItem(item); setShowAdd(true) }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sand font-semibold flex items-center gap-2">
            <span>{meta.emoji}</span> {meta.label}
          </h2>
          {totalPrice > 0 && (
            <p className="text-aqua text-sm mt-0.5">Totale: €{totalPrice.toFixed(2)}</p>
          )}
        </div>
        {!readonly && (!isVoli || !flightItem) && (
          <Button onClick={openAdd} size="sm">+ {isVoli ? 'Aggiungi voli' : 'Aggiungi'}</Button>
        )}
        {!readonly && isVoli && flightItem && (
          <Button variant="secondary" size="sm" onClick={() => openEdit(flightItem)}>Modifica voli</Button>
        )}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <span className="text-5xl opacity-20">{meta.emoji}</span>
          <p className="text-sand/30 text-sm">Nessun elemento</p>
          {!readonly && (
            <Button size="sm" variant="secondary" onClick={openAdd}>
              {isVoli ? 'Configura voli' : 'Aggiungi il primo'}
            </Button>
          )}
        </div>
      ) : isVoli ? (
        <div>
          {pendingDelete === flightItem?.id && (
            <div className="mb-3 px-4 py-2 bg-red-950/40 rounded-xl text-red-300 text-xs flex items-center justify-between">
              <span>Clicca Elimina di nuovo per confermare</span>
              <button onClick={() => setPendingDelete(null)} className="text-red-300/50 hover:text-red-300">Annulla</button>
            </div>
          )}
          {flightItem && (
            <FlightCard
              item={flightItem}
              onDelete={handleDelete}
              onEdit={() => openEdit(flightItem)}
              readonly={readonly}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id}>
              {pendingDelete === item.id && (
                <div className="mb-2 px-4 py-2 bg-red-950/40 rounded-xl text-red-300 text-xs flex items-center justify-between">
                  <span>Clicca ✕ di nuovo per confermare</span>
                  <button onClick={() => setPendingDelete(null)} className="text-red-300/50 hover:text-red-300">Annulla</button>
                </div>
              )}
              <ItemCard item={item} onDelete={handleDelete} readonly={readonly} />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {!readonly && isVoli && (
        <AddFlightModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSaved={refresh}
          destinationId={destinationId}
          existingItem={editingItem}
        />
      )}
      {!readonly && !isVoli && (
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
