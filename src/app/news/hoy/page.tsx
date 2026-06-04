import { leerUltimoBrief } from '@/lib/news/storage'
import { BriefView } from '../BriefView'
import { NewsShell } from '../NewsShell'
import styles from '../news.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HoyPage() {
  const brief = await leerUltimoBrief()

  return (
    <NewsShell titulo="Hoy">
      {brief ? (
        <BriefView brief={brief} />
      ) : (
        <section className={styles.card}>
          <h2>Sin brief</h2>
        </section>
      )}
    </NewsShell>
  )
}
