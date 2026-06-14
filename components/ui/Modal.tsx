'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${maxWidth} bg-[#132435] rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/8`}>
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-sand font-semibold">{title}</h2>
            <button onClick={onClose}
              className="text-[#6B8FA8] hover:text-sand transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5"
              aria-label="Chiudi">
              ✕
            </button>
          </div>
        )}
        <div className={title ? 'px-6 pb-6' : 'p-6'}>{children}</div>
      </div>
    </div>
  )
}
