'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

type Mode = 'password' | 'magic'

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  color: 'rgba(255,255,255,0.9)',
  fontSize: 14,
  padding: '12px 16px',
  width: '100%',
  outline: 'none',
  transition: 'all 0.2s',
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const reset = () => { setEmail(''); setPassword(''); setSent(false) }
  const handleModeSwitch = (next: Mode) => { setMode(next); reset() }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast(error.message === 'Invalid login credentials' ? 'Email o password errati' : error.message, 'error')
    } else {
      onClose(); router.refresh()
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    })
    setLoading(false)
    if (error) toast(error.message, 'error')
    else setSent(true)
  }

  return (
    <Modal open={open} onClose={onClose} title="Accedi a WanderPlan">
      {/* Tab toggle */}
      <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {(['password', 'magic'] as Mode[]).map(m => (
          <button key={m} type="button" onClick={() => handleModeSwitch(m)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150"
            style={mode === m
              ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.38)' }}>
            {m === 'password' ? 'Password' : 'Magic link'}
          </button>
        ))}
      </div>

      {mode === 'password' && (
        <form onSubmit={handlePassword} className="flex flex-col gap-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required autoComplete="email" style={INPUT_STYLE}
            onFocus={e => { e.target.style.border = '1px solid rgba(255,107,74,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,74,0.12)' }}
            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = '' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" required autoComplete="current-password" style={INPUT_STYLE}
            onFocus={e => { e.target.style.border = '1px solid rgba(255,107,74,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,74,0.12)' }}
            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = '' }} />
          <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </Button>
        </form>
      )}

      {mode === 'magic' && (
        sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">📬</div>
            <p className="font-medium mb-2" style={{ color: 'rgba(255,255,255,0.88)' }}>Controlla la tua email</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Link inviato a <strong style={{ color: 'rgba(255,255,255,0.78)' }}>{email}</strong>
            </p>
            <Button variant="ghost" size="sm" className="mt-4" onClick={reset}>
              Usa un&apos;altra email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="La tua email" required autoComplete="email" style={INPUT_STYLE}
              onFocus={e => { e.target.style.border = '1px solid rgba(255,107,74,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,74,0.12)' }}
              onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = '' }} />
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Invio in corso…' : 'Invia magic link'}
            </Button>
          </form>
        )
      )}
    </Modal>
  )
}
