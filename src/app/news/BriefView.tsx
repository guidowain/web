import type { BriefDiario, CategoriaNoticias, NoticiaNormalizada } from '@/lib/news/types'
import { NewsActions } from './NewsActions'
import styles from './news.module.css'

const CAT_CLASS: Record<CategoriaNoticias, string> = {
  'AI': styles.catAI,
  'Apple': styles.catApple,
  'Finance': styles.catFinance,
  'Argentina': styles.catArgentina,
  'Business': styles.catBusiness,
  'Marketing': styles.catMarketing,
  'Tools & Automation': styles.catTools,
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(value))
}

function NewsItem({ noticia }: { noticia: NoticiaNormalizada }) {
  const dotClass = CAT_CLASS[noticia.categoria] ?? styles.catDefault

  return (
    <article className={styles.article}>
      <div className={styles.articleMeta}>
        <span className={`${styles.categoryDot} ${dotClass}`} />
        <span className={styles.categoryLabel}>{noticia.categoria}</span>
        <span className={styles.metaSep}>·</span>
        <span className={styles.sourceMeta}>{noticia.fuente}</span>
        <span className={styles.metaSep}>·</span>
        <span className={styles.sourceMeta}>{formatTime(noticia.publicadoEn)}</span>
        <span className={`${styles.score} ${styles.metaSep}`} style={{ marginLeft: 'auto' }}>
          {noticia.personalScore}
        </span>
      </div>

      {noticia.imagen && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.articleImage} src={noticia.imagen} alt="" loading="lazy" />
      )}
      <h2 className={styles.articleTitle}>
        <a href={noticia.url} target="_blank" rel="noreferrer">
          {noticia.tituloLimpio}
        </a>
      </h2>

      {noticia.resumen && <p className={styles.articleSummary}>{noticia.resumen}</p>}

      <NewsActions noticia={noticia} />
    </article>
  )
}

export function BriefView({ brief }: { brief: BriefDiario }) {
  const ts = `${formatDate(brief.generadoEn)} · ${formatTime(brief.generadoEn)} · ${brief.actualizacion}`

  return (
    <>
      <div className={styles.status}>
        <span className={`${styles.statusDot} ${brief.estado.estado === 'error' ? styles.statusDotError : ''}`} />
        {ts}
        {brief.estado.estado === 'error' && ` · ${brief.estado.mensaje}`}
      </div>

      {brief.resumenEjecutivo && (
        <section className={styles.executive}>
    <p className={styles.executiveText}>{brief.resumenEjecutivo}</p>
        </section>
      )}

      <div className={styles.articles}>
        {brief.noticias.map((n) => <NewsItem key={n.id} noticia={n} />)}
      </div>
    </>
  )
}
