import AdminEditor from './AdminEditor'
import { loadSiteContent } from '@/lib/admin/siteContentStore'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Admin — Guido Wain',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPage() {
  const content = await loadSiteContent()

  return <AdminEditor initialContent={content} />
}
