import { leerUltimoBrief } from '@/lib/news/storage'
import { BriefView } from '../BriefView'
import { NewsShell } from '../NewsShell'
import styles from '../news.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HoyPage() {
  const brief = await leerUltimoBrief()

  return (
    <NewsShell>
      {brief ? (
        <BriefView brief={brief} />
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◌</div>
          <p className={styles.emptyText}>Sin brief disponible</p>
        </div>
      )}
    </NewsShell>
  )
}
