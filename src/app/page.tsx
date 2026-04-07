'use client'

import { useMemo } from 'react'
import Carousel from './Carousel'
import styles from './page.module.css'
import { getLang } from '@/lib/getLang'
import { translations } from '@/lib/translations'

export default function Home() {
  const lang = getLang()
  const copy = useMemo(() => translations[lang], [lang])

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          GUID<span className={styles.navAccent}>O</span> WAIN
        </div>
        <a href="#contact" className={styles.navContact}>
          {copy.navContact}
        </a>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.nameWrap}>
            <h1 className={styles.heroName}>
              <span className={styles.heroWord}>
                GUID<span className={styles.heroAccent}>O</span>
              </span>
              <span className={`${styles.heroWord} ${styles.heroWord2}`}>WAIN</span>
            </h1>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.heroContent}>
            <div className={styles.heroBottom}>
              <div className={styles.heroSub}>{copy.heroSub}</div>
              <p className={styles.heroDesc}>{copy.heroDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {[...copy.marquee, ...copy.marquee].map((item, i) => (
            <span key={i} className={styles.mi}>
              {item}
              <span className={styles.miDot}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <Carousel />

      <section className={styles.about}>
        <div className={styles.aboutLeft}>
          <div className={styles.aboutInner}>
            <div className={styles.aboutBig}>
              <span className={styles.aboutLine}>{copy.aboutLine1}</span>
              <span className={styles.aboutLine}>{copy.aboutLine2}</span>
            </div>
          </div>
        </div>

        <div className={styles.aboutRight}>
          <div className={styles.aboutCopy}>
            <p className={styles.aboutBody}>{copy.aboutBody1}</p>

            <p className={styles.aboutBody}>{copy.aboutBody2}</p>
          </div>
        </div>
      </section>

      <section id="contact" className={styles.contact}>
        <div className={styles.contactHead}>
          {copy.contactLine1}
          {copy.contactLine2 && (
            <>
              <br />
              {copy.contactLine2}
            </>
          )}
          {copy.contactLine3 && (
            <>
              <br />
              {copy.contactLine3}
            </>
          )}
        </div>

        <div className={styles.contactRight}>
          <a href="mailto:contact@guidowain.com" className={styles.contactLink}>
            contact@guidowain.com
          </a>
          <a
            href="https://wa.me/5491163357223"
            target="_blank"
            rel="noreferrer"
            className={styles.contactLink}
          >
            +54 9 11 6335 7223
          </a>

          <div className={styles.socials}>
            <a
              href="http://www.linkedin.com/in/guidowainstein"
              target="_blank"
              rel="noreferrer"
              className={styles.social}
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 448 512" aria-hidden="true">
                <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 01107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/waintouch"
              target="_blank"
              rel="noreferrer"
              className={styles.social}
              aria-label="Instagram"
            >
              <svg viewBox="0 0 448 512" aria-hidden="true">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>®2026 Guido Wain</span>
        <span>{copy.footerLocation}</span>
      </footer>
    </>
  )
}
