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
      <button
        className={styles.actionBtn}
        disabled={estado === 'saving'}
        onClick={() => sendFeedback('interesante')}
        title="Me interesa"
      >
        ↑
      </button>
      <button
        className={styles.actionBtn}
        disabled={estado === 'saving'}
        onClick={() => sendFeedback('no_interesante')}
        title="No me interesa"
      >
        ↓
      </button>
      <div className={styles.actionSep} />
      <button
        className={styles.actionBtn}
        disabled={estado === 'saving'}
        onClick={save}
        title="Guardar"
      >
        ⊕
      </button>
      {estado === 'saved' && <span className={styles.actionFeedback}>guardado</span>}
      {estado === 'error' && <span className={styles.actionError}>error</span>}
    </div>
  )
}
