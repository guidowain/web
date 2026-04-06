'use client'

import { useEffect, useState } from 'react'
import Carousel from './Carousel'
import styles from './page.module.css'

const BRANDS = ['Nike', 'Adidas', 'BMW', 'P&G', 'HP', 'Shure', 'Upwork']

const SERVICES = [
  'Skin Cleanup',
  'Colour Grading',
  'Product / Packshot',
  'BG Removal',
  'Compositing',
  'Restoration',
  'RAW Processing',
  'AI Generation',
]

const MARQUEE = [
  'Skin Cleanup',
  'Colour Grading',
  'Product Packshot',
  'BG Removal',
  'Creative Compositing',
  'Image Restoration',
  'RAW Processing',
  'AI Generation',
]

export default function Home() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [visibleSvc, setVisibleSvc] = useState(0)

  useEffect(() => {
    let i = 0
    let delay = 80
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const tick = () => {
      i++
      setVisibleSvc(i)

      if (i < SERVICES.length) {
        delay = i < 4 ? delay + 60 : delay + 100
        timeoutId = setTimeout(tick, delay)
      }
    }

    timeoutId = setTimeout(tick, 600)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          GUID<span className={styles.navAccent}>O</span> WAIN
        </div>

        <a href="#contact" className={styles.navContact}>
          Contact
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
              <div className={styles.heroSub}>Retoucher &amp; AI Artist</div>
              <p className={styles.heroDesc}>
                Buenos Aires · 12+ years turning good shots into scroll-stoppers for
                fashion, beauty &amp; lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.servicesPanel}>
        {SERVICES.map((svc, i) => (
          <div
            key={svc}
            className={[
              styles.svcRow,
              i < visibleSvc ? styles.svcVisible : '',
              activeIdx !== null && activeIdx !== i ? styles.svcDim : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <span className={styles.svcName}>{svc}</span>
            <span className={styles.svcArrow}>↗</span>
          </div>
        ))}
      </section>

      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`} className={styles.mi}>
              {item}
              <span className={styles.miDot}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <Carousel />

      <section className={styles.about}>
        <div className={styles.aboutLeft}>
          <h2 className={styles.aboutBig}>
            <em>pixel PERFECT</em>
            every TIME.
          </h2>

          <div className={styles.brands}>
            {BRANDS.map((brand) => (
              <span key={brand} className={styles.brand}>
                {brand}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.aboutRight}>
          <p className={styles.aboutBody}>
            I&apos;m Guido Wain — a Buenos Aires-based photo retoucher and AI artist
            with 12+ years turning good shots into scroll-stoppers. After a decade
            working shoulder-to-shoulder with photographers and art directors across
            fashion, beauty and lifestyle, I went solo to give brands a fast,
            fuss-free path to pixel-perfect images.
          </p>

          <p className={styles.aboutBody}>
            Whether you need a full campaign polished, one hero shot rescued, or
            AI-generated visuals that nobody can tell apart from a real shoot — I
            deliver production-ready files that make art directors relax and products
            pop.
          </p>

          <div className={styles.services}>
            {SERVICES.map((service) => (
              <div key={service} className={styles.svc}>
                {service}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={styles.contact}>
        <h2 className={styles.contactHead}>
          LET&apos;S
          <br />
          WORK
          <br />
          TOGETHER.
        </h2>

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
            +54 911 6335 7223
          </a>

          <div className={styles.socials}>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className={styles.social}
            >
              LinkedIn ↗
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className={styles.social}
            >
              Instagram ↗
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>®2026 Guido Wain</span>
        <span>Buenos Aires, Argentina</span>
      </footer>
    </>
  )
}
