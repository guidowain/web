import { notFound } from 'next/navigation'
import { leerBrief } from '@/lib/news/storage'
import { BriefView } from '../BriefView'
import { NewsShell } from '../NewsShell'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FechaPage({ params }: { params: { fecha: string } }) {
  try {
    const brief = await leerBrief(params.fecha)
    return (
      <NewsShell>
        <BriefView brief={brief} />
      </NewsShell>
    )
  } catch {
    notFound()
  }
}
