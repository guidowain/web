'use client'

import Carousel from './Carousel'
import styles from './page.module.css'

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
                Buenos Aires · 12+ years turning good shots into scroll-stoppers for fashion,
                beauty &amp; lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
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
              <span className={styles.aboutLine}>PIXEL PERFECT.</span>
              <span className={styles.aboutLine}>EVERY TIME.</span>
            </div>
          </div>
        </div>

        <div className={styles.aboutRight}>
          <div className={styles.aboutCopy}>
            <p className={styles.aboutBody}>
              I'm Guido Wain — a Buenos Aires-based photo retoucher and AI artist with 12+ years
              turning good shots into scroll-stoppers. After a decade working shoulder-to-shoulder
              with photographers and art directors across fashion, beauty and lifestyle, I went
              solo to give brands a fast, fuss-free path to pixel-perfect images.
            </p>

            <p className={styles.aboutBody}>
              Whether you need a full campaign polished, one hero shot rescued, or AI-generated
              visuals that nobody can tell apart from a real shoot — I deliver production-ready
              files that make art directors relax and products pop.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className={styles.contact}>
        <div className={styles.contactHead}>
          LET&apos;S
          <br />
          WORK
          <br />
          TOGETHER.
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
            +54 911 6335 7223
          </a>

          <div className={styles.socials}>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className={styles.social}
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7 0h3.6v2.2h.05c.5-.95 1.75-2.2 3.6-2.2 3.85 0 4.55 2.5 4.55 5.75V24h-4v-8.75c0-2.1-.05-4.75-2.9-4.75-2.9 0-3.35 2.25-3.35 4.6V24h-4V8z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className={styles.social}
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.5.5.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.5.4 1.3.5 2.5.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.5-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.5.2-1.3.4-2.5.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.5-.5-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.5-.4-1.3-.5-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .5-2.5.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.5-.2 1.3-.4 2.5-.5C8.4 2.2 8.8 2.2 12 2.2zm0 3.8a6 6 0 100 12 6 6 0 000-12zm0 9.8a3.8 3.8 0 110-7.6 3.8 3.8 0 010 7.6zm6.4-10.6a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0z" />
              </svg>
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
