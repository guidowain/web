import HomeClient from './HomeClient'
import { loadSiteContent } from '@/lib/admin/siteContentStore'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const content = await loadSiteContent()

  return <HomeClient content={content} />
}
