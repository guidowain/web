import type { BriefDiario, NoticiaNormalizada } from '@/lib/news/types'
import { NewsActions } from './NewsActions'
import styles from './news.module.css'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function NewsItem({ noticia }: { noticia: NoticiaNormalizada }) {
  return (
    <article className={styles.item}>
      <h3 className={styles.itemTitle}>
        <a href={noticia.url} target="_blank" rel="noreferrer">{noticia.tituloLimpio}</a>
      </h3>
      <p className={styles.meta}>
        <span>{noticia.categoria}</span>
        <span>{noticia.fuente}</span>
        <span>{noticia.personalScore}</span>
      </p>
      <p className={styles.body}>{noticia.resumen}</p>
      {noticia.porQueImporta ? <p className={styles.body}>{noticia.porQueImporta}</p> : null}
      <NewsActions noticia={noticia} />
    </article>
  )
}

export function BriefView({ brief }: { brief: BriefDiario }) {
  return (
    <div className={styles.stack}>
      <section className={brief.estado.estado === 'ok' ? styles.statusOk : styles.statusError}>
        {formatDate(brief.generadoEn)} · {brief.actualizacion}
        {brief.estado.estado === 'error' ? <span> · Error: {brief.estado.mensaje}</span> : null}
      </section>

      {brief.resumenEjecutivo ? (
        <section className={styles.card}>
          <p className={styles.body}>{brief.resumenEjecutivo}</p>
        </section>
      ) : null}

      <section className={styles.card}>
        <div className={styles.list}>
          {brief.noticias.map((noticia) => <NewsItem key={noticia.id} noticia={noticia} />)}
        </div>
      </section>
    </div>
  )
}
