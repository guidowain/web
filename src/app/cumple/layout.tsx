import type { Metadata } from 'next'
import { Playfair_Display, Dancing_Script } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-dancing',
})

export const metadata: Metadata = {
  title: 'Cumple de Guido 🎂',
  description: 'Una noche para celebrar 35 años.',
  robots: { index: false, follow: false },
}

export default function CumpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${dancing.variable}`} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
