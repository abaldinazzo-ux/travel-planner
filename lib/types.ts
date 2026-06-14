export type Category = 'voli' | 'hotel' | 'ristoranti' | 'itinerari' | 'attivita' | 'note'

export interface Destination {
  id: string
  user_id: string
  name: string
  country: string | null
  emoji: string
  color: string
  date_from: string | null
  date_to: string | null
  budget: number | null
  pos_x: number
  pos_y: number
  created_at: string
}

export interface DestinationItem {
  id: string
  destination_id: string
  category: Category
  name: string
  price: number | null
  rating: number | null
  notes: string | null
  url: string | null
  created_at: string
}

export interface TripShare {
  id: string
  destination_id: string
  owner_id: string
  shared_with: string | null
  share_token: string
  can_edit: boolean
  created_at: string
}

export interface DestinationWithItems extends Destination {
  destination_items: DestinationItem[]
}

export const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  voli:        { label: 'Voli',       emoji: '✈️',  color: '#3B82F6' },
  hotel:       { label: 'Alloggio',   emoji: '🏨',  color: '#8B5CF6' },
  ristoranti:  { label: 'Ristoranti', emoji: '🍽️',  color: '#F59E0B' },
  itinerari:   { label: 'Itinerari',  emoji: '🗺️',  color: '#10B981' },
  attivita:    { label: 'Attività',   emoji: '🎯',  color: '#E07A5F' },
  note:        { label: 'Note',       emoji: '📝',  color: '#6B7280' },
}

export const DESTINATION_COLORS = [
  '#3B6D8A', '#5C4B8A', '#8A4B5C', '#4B8A5C', '#8A7A3B', '#3B8A7A',
]
