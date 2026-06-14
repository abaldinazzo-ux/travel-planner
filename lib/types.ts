export type Category = 'voli' | 'hotel' | 'ristoranti' | 'itinerari' | 'attivita' | 'note'
export type ItemStatus = 'idea' | 'found' | 'booked'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export interface Destination {
  id: string
  user_id: string
  name: string
  country: string | null
  emoji: string
  color: string
  date_from: string | null
  date_to: string | null
  period_note: string | null
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
  status: ItemStatus
  scheduled_date: string | null   // "2026-08-10"
  time_of_day: TimeOfDay | null
  created_at: string
}

export interface FlightLeg {
  date: string
  time: string
  from: string
  to: string
  airline: string
  price: string
  url: string
}

export interface FlightData {
  outbound: Partial<FlightLeg>
  return: Partial<FlightLeg>
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

export interface DestinationStub {
  id: string
  name: string
  emoji: string
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

export const SECTION_ORDER: Category[] = ['voli', 'hotel', 'ristoranti', 'itinerari', 'attivita', 'note']

export const SLOT_META: Record<TimeOfDay, { label: string; emoji: string }> = {
  morning:   { label: 'Mattina',     emoji: '🌅' },
  afternoon: { label: 'Pomeriggio',  emoji: '☀️' },
  evening:   { label: 'Sera',        emoji: '🌙' },
}

export const TIME_SLOTS: TimeOfDay[] = ['morning', 'afternoon', 'evening']

export const STATUS_CYCLE: Record<ItemStatus, ItemStatus> = {
  idea: 'found', found: 'booked', booked: 'idea',
}

export function formatPeriod(dateFrom: string | null, periodNote?: string | null): string {
  if (!dateFrom) return ''
  const d = new Date(dateFrom + 'T12:00:00')
  const month = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  return periodNote ? `${month} · ${periodNote}` : month
}
