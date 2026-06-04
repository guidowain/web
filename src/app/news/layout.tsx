import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'News Brief',
  description: 'Brief personal de noticias para Guido Wain.',
  robots: { index: false, follow: false },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
