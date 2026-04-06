import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,800;0,900;1,300&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
