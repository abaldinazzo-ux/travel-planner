'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
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

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Accedi a WanderPlan">
      {sent ? (
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
            onClick={() => { setSent(false); setEmail('') }}
          >
            Usa un&apos;altra email
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Button
            variant="secondary"
            size="lg"
            className="w-full gap-2"
            onClick={handleGoogle}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continua con Google
          </Button>

          <div className="flex items-center gap-3 text-sand/30 text-sm">
            <div className="flex-1 h-px bg-sand/10" />
            oppure
            <div className="flex-1 h-px bg-sand/10" />
          </div>

          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="La tua email"
              required
              className="w-full px-4 py-3 bg-navy border border-sand/20 rounded-xl text-sand placeholder-sand/30 focus:outline-none focus:border-coral transition-colors"
            />
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Invio in corso…' : 'Invia link magico'}
            </Button>
          </form>
        </div>
      )}
    </Modal>
  )
}
