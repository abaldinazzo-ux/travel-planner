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
    <nav className="flex gap-1 px-4 pb-2">
      {tabs.map(tab => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-[#1A2E42] text-sand'
                : 'text-[#6B8FA8] hover:text-sand hover:bg-white/5'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
