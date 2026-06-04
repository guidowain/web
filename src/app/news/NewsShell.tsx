import type { ReactNode } from 'react'
import { NewsNav } from './NewsNav'
import styles from './news.module.css'

export function NewsShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <span className={styles.wordmark}>
            Brief<span className={styles.wordmarkDot}>.</span>
          </span>
          <NewsNav />
        </header>
        {children}
      </div>
    </main>
  )
}
