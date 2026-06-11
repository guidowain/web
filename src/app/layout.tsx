import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'Guido Wain — Retoucher & AI Artist',
  description: 'Buenos Aires photo retoucher and AI artist crafting colour-perfect visuals for fashion & lifestyle.',
  openGraph: {
    title: 'Guido Wain — Retoucher & AI Artist',
    description: 'Buenos Aires photo retoucher and AI artist crafting colour-perfect visuals for fashion & lifestyle.',
    url: 'https://guidowain.com',
    siteName: 'Guido Wain',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>{children}</body>
    </html>
  )
}
