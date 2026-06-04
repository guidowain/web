import { leerGuardadas } from '@/lib/news/storage'
import { NewsActions } from '../NewsActions'
import { NewsShell } from '../NewsShell'
import styles from '../news.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GuardadasPage() {
  const guardadas = await leerGuardadas()

  return (
    <NewsShell titulo="Guardadas">
      <section className={styles.card}>
        <h2>Lista</h2>
        {guardadas.length ? (
          <div className={styles.list}>
            {guardadas.map(({ noticia, guardadaEn }) => (
              <article key={noticia.id} className={styles.item}>
                <h3 className={styles.itemTitle}><a href={noticia.url} target="_blank" rel="noreferrer">{noticia.tituloLimpio}</a></h3>
                <p className={styles.meta}>{noticia.categoria} · {noticia.fuente} · {new Date(guardadaEn).toLocaleDateString('es-AR')}</p>
                <p className={styles.body}>{noticia.resumen}</p>
                <NewsActions noticia={noticia} />
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.body}>Vacío.</p>
        )}
      </section>
    </NewsShell>
  )
}
