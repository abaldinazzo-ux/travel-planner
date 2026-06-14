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
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />

      {/* Modal */}
      <div className={`relative w-full ${maxWidth} glass-strong modal-enter shadow-2xl`} style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        {title && (
          <div className="flex items-center justify-between px-7 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
            <h2 className="font-semibold" style={{ color: 'rgba(255,255,255,0.95)', fontSize: 16, letterSpacing: '-0.3px' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>
        )}
        <div className={title ? 'px-7 pb-7' : 'p-7'}>{children}</div>
      </div>
    </div>
  )
}
