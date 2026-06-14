'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { QuickCaptureModal } from '@/components/capture/QuickCaptureModal'

export function GlobalUI() {
  const [showCapture, setShowCapture] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCapture(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {!isHome && (
        <button
          onClick={() => setShowCapture(true)}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-coral text-white text-xl flex items-center justify-center shadow-lg shadow-coral/20 hover:bg-coral/85 active:scale-95 transition-all duration-150"
          aria-label="Quick Capture (⌘K)"
          title="Quick Capture (⌘K)"
        >
          +
        </button>
      )}
      <QuickCaptureModal open={showCapture} onClose={() => setShowCapture(false)} />
    </>
  )
}
