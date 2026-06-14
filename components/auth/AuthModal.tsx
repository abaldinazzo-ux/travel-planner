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
      )}
    </Modal>
  )
}
