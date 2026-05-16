'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './cumple.module.css'

// Poné las fotos en public/images/cumple/ con el nombre 1.png, 2.png, etc.
// Cuando agregues fotos, cambiá este número:
const PHOTO_COUNT = 13

const PHOTOS: string[] = Array.from(
  { length: PHOTO_COUNT },
  (_, i) => `/images/cumple/${i + 1}.webp`
)

const PLACEHOLDER_COUNT = 5

export default function Slideshow() {
  const [current, setCurrent] = useState(0)
  const photos = PHOTOS.length > 0 ? PHOTOS : Array(PLACEHOLDER_COUNT).fill(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % photos.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [photos.length])

  return (
    <section className={styles.hero}>
      {photos.map((src, i) => (
        <div key={i} className={`${styles.slide} ${i === current ? styles.slideActive : ''}`}>
          {src ? (
            <Image
              src={src}
              alt={`Guido — foto ${i + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority={i === 0}
            />
          ) : (
            <div className={styles.slidePlaceholder}>
              <span>foto {i + 1}</span>
            </div>
          )}
        </div>
      ))}

      <div className={styles.heroOverlay}>
        <p className={styles.heroSubtitle}>una noche para celebrar</p>
        <h1 className={styles.heroTitle}>35</h1>
        <p className={styles.heroName}>Guido Wain</p>
      </div>

      <div className={styles.heroDots}>
        {photos.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Foto ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
