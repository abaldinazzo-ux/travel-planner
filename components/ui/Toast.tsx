'use client'

import { createContext, useContext, useCallback, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; message: string; type: ToastType }
interface ToastContextValue { toast: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  let nextId = 0

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const TOAST_STYLE: Record<ToastType, React.CSSProperties> = {
    success: { background: 'rgba(78, 203, 160, 0.18)', border: '1px solid rgba(78,203,160,0.35)', color: 'rgba(255,255,255,0.95)' },
    error:   { background: 'rgba(255, 107, 74, 0.18)', border: '1px solid rgba(255,107,74,0.35)', color: 'rgba(255,255,255,0.95)' },
    info:    { background: 'rgba(255,255,255,0.08)',    border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.88)' },
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="px-4 py-3 rounded-xl text-sm font-medium shadow-2xl pointer-events-auto glass-appear"
            style={{
              ...TOAST_STYLE[t.type],
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() { return useContext(ToastContext) }
