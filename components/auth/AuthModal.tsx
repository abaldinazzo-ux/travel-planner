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
      toast(
        error.message === 'Invalid login credentials'
          ? 'Email o password errati'
          : error.message,
        'error'
      )
    } else {
      onClose()
      router.refresh()
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    setLoading(false)
    if (error) {
      toast(error.message, 'error')
    } else {
      setSent(true)
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-navy border border-sand/20 rounded-xl text-sand placeholder-sand/30 focus:outline-none focus:border-coral transition-colors'

  return (
    <Modal open={open} onClose={onClose} title="Accedi a WanderPlan">
      {/* Tab toggle */}
      <div className="flex rounded-lg bg-navy p-1 mb-5">
        <button
          type="button"
          onClick={() => handleModeSwitch('password')}
          className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${
            mode === 'password'
              ? 'bg-navy-light text-sand shadow'
              : 'text-sand/40 hover:text-sand/70'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('magic')}
          className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${
            mode === 'magic'
              ? 'bg-navy-light text-sand shadow'
              : 'text-sand/40 hover:text-sand/70'
          }`}
        >
          Magic link
        </button>
      </div>

      {mode === 'password' && (
        <form onSubmit={handlePassword} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
          <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </Button>
        </form>
      )}

      {mode === 'magic' && (
        sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-sand font-medium mb-2">Controlla la tua email</p>
            <p className="text-sand/60 text-sm">
              Abbiamo inviato un link magico a <strong className="text-sand">{email}</strong>
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={reset}
            >
              Usa un&apos;altra email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="La tua email"
              required
              autoComplete="email"
              className={inputClass}
            />
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Invio in corso…' : 'Invia magic link'}
            </Button>
          </form>
        )
      )}
    </Modal>
  )
}
