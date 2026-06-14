'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DestinationTabNavProps {
  destId: string
}

export function DestinationTabNav({ destId }: DestinationTabNavProps) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Dashboard',  href: `/destinations/${destId}` },
    { label: 'Itinerario', href: `/destinations/${destId}/dayview` },
    { label: 'Timeline',   href: `/destinations/${destId}/timeline` },
  ]

  return (
    <nav className="flex gap-1 px-4 pb-2.5">
      {tabs.map(tab => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
            style={isActive
              ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.92)', borderBottom: '2px solid rgba(255,107,74,0.7)' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.38)' }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.38)' }}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
