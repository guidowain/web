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
