'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './cumple.module.css'

// TODO: reemplazar con las rutas reales cuando tengas las fotos
// Agregá cada foto en public/images/cumple/ y listá los paths acá (hasta 12)
const PHOTOS: string[] = [
  // '/images/cumple/foto1.jpg',
  // '/images/cumple/foto2.jpg',
  // '/images/cumple/foto3.jpg',
  // '/images/cumple/foto4.jpg',
  // '/images/cumple/foto5.jpg',
  // '/images/cumple/foto6.jpg',
  // '/images/cumple/foto7.jpg',
  // '/images/cumple/foto8.jpg',
  // '/images/cumple/foto9.jpg',
  // '/images/cumple/foto10.jpg',
  // '/images/cumple/foto11.jpg',
  // '/images/cumple/foto12.jpg',
]

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
