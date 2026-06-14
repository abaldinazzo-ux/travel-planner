'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm min-w-0">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5 min-w-0">
          {i > 0 && <span className="text-[#6B8FA8]/40 shrink-0">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-[#6B8FA8] hover:text-sand transition-colors truncate"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sand truncate">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
