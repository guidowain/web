import type { Metadata } from 'next'
import { Newsreader, Inter } from 'next/font/google'

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['400', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'News Brief',
  description: 'Brief personal de noticias para Guido Wain.',
  robots: { index: false, follow: false },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${newsreader.variable} ${inter.variable}`}>
      {children}
    </div>
  )
}
