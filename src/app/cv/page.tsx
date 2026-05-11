import type { Metadata } from 'next'
import { loadSiteContent } from '@/lib/admin/siteContentStore'
import CvView from './CvView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'CV - Guido Wainstein',
  description: 'Curriculum vitae for Guido Wainstein, photo retoucher and AI artist.',
  alternates: {
    canonical: '/cv',
  },
  openGraph: {
    title: 'CV - Guido Wainstein',
    description: 'Curriculum vitae for Guido Wainstein, photo retoucher and AI artist.',
    url: 'https://guidowain.com/cv',
    siteName: 'Guido Wain',
    type: 'profile',
  },
}

export default async function CvPage() {
  const content = await loadSiteContent()

  return <CvView content={content} />
}
