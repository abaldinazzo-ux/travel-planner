import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { GlobalUI } from '@/components/ui/GlobalUI'

export const metadata: Metadata = {
  title: 'WanderPlan',
  description: 'Pianifica i tuoi viaggi con stile',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <ToastProvider>
          {children}
          <GlobalUI />
        </ToastProvider>
      </body>
    </html>
  )
}
