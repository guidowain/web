'use client'

import { useState } from 'react'
import type { FeedbackValor, NoticiaNormalizada } from '@/lib/news/types'
import styles from './news.module.css'

export function NewsActions({ noticia }: { noticia: NoticiaNormalizada }) {
  const [estado, setEstado] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function sendFeedback(feedback: FeedbackValor) {
    setEstado('saving')
    const response = await fetch('/api/news/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noticia, feedback }),
    })
    setEstado(response.ok ? 'saved' : 'error')
  }

  async function save() {
    setEstado('saving')
    const response = await fetch('/api/news/guardadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noticia }),
    })
    setEstado(response.ok ? 'saved' : 'error')
  }

  return (
    <div className={styles.actions}>
      <button className={styles.smallButton} disabled={estado === 'saving'} onClick={() => sendFeedback('interesante')} aria-label="Me gusta">👍</button>
      <button className={styles.smallButton} disabled={estado === 'saving'} onClick={() => sendFeedback('no_interesante')} aria-label="No me gusta">👎</button>
      <button className={styles.smallButton} disabled={estado === 'saving'} onClick={save}>Guardar</button>
      <a className={styles.smallButton} href={noticia.url} target="_blank" rel="noreferrer">Leer</a>
      {estado === 'saved' ? <span className={styles.muted}>OK</span> : null}
      {estado === 'error' ? <span className={styles.errorText}>Error</span> : null}
    </div>
  )
}
