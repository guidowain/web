'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './news.module.css'

export function NewsNav() {
  const path = usePathname()

  return (
    <nav className={styles.nav}>
      <Link
        href="/news/hoy"
        className={`${styles.navLink} ${path?.startsWith('/news/hoy') ? styles.navLinkActive : ''}`}
      >
        Hoy
      </Link>
      <Link
        href="/news/guardadas"
        className={`${styles.navLink} ${path?.startsWith('/news/guardadas') ? styles.navLinkActive : ''}`}
      >
        Guardadas
      </Link>
    </nav>
  )
}
