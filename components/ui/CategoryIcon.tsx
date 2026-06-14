import { Plane, BedDouble, Utensils, Map, Target, FileText, type LucideProps } from 'lucide-react'
import { Category } from '@/lib/types'

const ICONS: Record<Category, React.FC<LucideProps>> = {
  voli:       Plane,
  hotel:      BedDouble,
  ristoranti: Utensils,
  itinerari:  Map,
  attivita:   Target,
  note:       FileText,
}

export function CategoryIcon({ category, size = 16, ...props }: { category: Category } & LucideProps) {
  const Icon = ICONS[category]
  return <Icon size={size} strokeWidth={1.5} {...props} />
}
