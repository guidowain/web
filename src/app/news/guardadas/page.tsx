import { leerGuardadas } from '@/lib/news/storage'
import { NewsActions } from '../NewsActions'
import { NewsShell } from '../NewsShell'
import styles from '../news.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GuardadasPage() {
  const guardadas = await leerGuardadas()

  return (
    <NewsShell>
      {guardadas.length ? (
        <div className={styles.articles}>
          {guardadas.map(({ noticia, guardadaEn }) => (
            <article key={noticia.id} className={styles.article}>
              <div className={styles.articleMeta}>
                <span className={styles.categoryLabel}>{noticia.categoria}</span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.sourceMeta}>{noticia.fuente}</span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.sourceMeta}>
                  {new Date(guardadaEn).toLocaleDateString('es-AR')}
                </span>
              </div>
              <h2 className={styles.articleTitle}>
                <a href={noticia.url} target="_blank" rel="noreferrer">{noticia.tituloLimpio}</a>
              </h2>
              {noticia.resumen && <p className={styles.articleSummary}>{noticia.resumen}</p>}
              <NewsActions noticia={noticia} />
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>○</div>
          <p className={styles.emptyText}>No hay noticias guardadas</p>
        </div>
      )}
    </NewsShell>
  )
}
