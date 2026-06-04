import type { ReactNode } from 'react'
import { NewsNav } from './NewsNav'
import styles from './news.module.css'

export function NewsShell({
  titulo,
  bajada,
  eyebrow,
  children,
}: {
  titulo: string
  bajada?: string
  eyebrow?: string
  children: ReactNode
}) {
  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h1 className={styles.title}>{titulo}</h1>
            {bajada ? <p className={styles.subtitle}>{bajada}</p> : null}
          </div>
          <NewsNav />
        </header>
        {children}
      </div>
    </main>
  )
}
