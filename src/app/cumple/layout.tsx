import type { Metadata } from 'next'
import { Bangers, Comic_Neue } from 'next/font/google'

const bangers = Bangers({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bangers',
})

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-comic',
})

export const metadata: Metadata = {
  title: '🎂 CUMPLE DE GUIDO 🎂',
  description: 'Una noche para celebrar 35 años.',
  robots: { index: false, follow: false },
}

export default function CumpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bangers.variable} ${comicNeue.variable}`} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
