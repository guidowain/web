'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './carousel.module.css'

const SLIDES = [
  { img: '/images/Messi.png',        client: 'ADIDAS'       },
  { img: '/images/Gillette.png',     client: 'GILLETTE'     },
  { img: '/images/BMW.jpg',          client: 'BMW'          },
  { img: '/images/Ritz.png',         client: 'RITZ'         },
  { img: '/images/Goose Island.png', client: 'GOOSE ISLAND' },
  { img: '/images/Model.jpg',        client: 'EDITORIAL'    },
  { img: '/images/Liquid IV.png',    client: 'LIQUID I.V.'  },
  { img: '/images/JustEgg.png',      client: 'JUST EGG'     },
  { img: '/images/HP 1.gif',         client: 'HP'           },
]

const AUTOPLAY_MS = 4500

export default function Carousel() {
  const [current, setCurrent]               = useState(0)
  const [prev, setPrev]                     = useState<number | null>(null)
  const [animating, setAnimating]           = useState(false)
  const [clientLabel, setClientLabel]       = useState(SLIDES[0].client)
  const [labelVisible, setLabelVisible]     = useState(false)
  const [clientBg, setClientBg]             = useState(SLIDES[0].client)
  const [clientBgShow, setClientBgShow]     = useState(true)
  const [paused, setPaused]                 = useState(false)
  const [progressKey, setProgressKey]       = useState(0)
  const dragStart = useRef<number | null>(null)

  // Initial label reveal
  useEffect(() => {
    const t = setTimeout(() => setLabelVisible(true), 600)
    return () => clearTimeout(t)
  }, [])

  const goTo = useCallback((idx: number) => {
    if (animating || idx === current) return
    setAnimating(true)
    setPrev(current)

    // bg text flicker out/in
    setClientBgShow(false)
    setTimeout(() => {
      setClientBg(SLIDES[idx].client)
      setClientBgShow(true)
    }, 200)

    // label slide
    setLabelVisible(false)
    setTimeout(() => {
      setClientLabel(SLIDES[idx].client)
      setLabelVisible(true)
    }, 350)

    // swap after crossfade starts
    setTimeout(() => {
      setCurrent(idx)
      setPrev(null)
      setProgressKey(k => k + 1)
      setAnimating(false)
    }, 700)
  }, [animating, current])

  const nextSlide = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo])
  const prevSlide = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo])

  // Autoplay
  useEffect(() => {
    if (paused) return
    const t = setTimeout(nextSlide, AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [current, paused, nextSlide])

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { setPaused(true); nextSlide() }
      if (e.key === 'ArrowLeft')  { setPaused(true); prevSlide() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [nextSlide, prevSlide])

  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX }
  const onPointerUp   = (e: React.PointerEvent) => {
    if (dragStart.current === null) return
    const diff = dragStart.current - e.clientX
    if (Math.abs(diff) > 50) { setPaused(true); diff > 0 ? nextSlide() : prevSlide() }
    dragStart.current = null
  }

  return (
    <section
      className={styles.section}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.topBar}>
        <span className={styles.sectionLabel}>Selected Work</span>
        <span className={styles.counter}>
          <span className={styles.counterCurrent}>{String(current + 1).padStart(2, '0')}</span>
          {' / '}{String(SLIDES.length).padStart(2, '0')}
        </span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          key={progressKey}
          className={styles.progressFill}
          style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
        />
      </div>

      {/* Client name — big bg */}
      <div className={`${styles.clientBg} ${clientBgShow ? styles.clientBgShow : ''}`}>
        {clientBg}
      </div>

      {/* Images — crossfade */}
      <div className={styles.imgArea}>
        {SLIDES.map((slide, i) => {
          const isActive = i === current
          const isLeaving = i === prev
          return (
            <div
              key={i}
              className={`${styles.slide} ${isActive ? styles.slideIn : ''} ${isLeaving ? styles.slideOut : ''}`}
            >
              <img
                src={slide.img}
                alt={slide.client}
                className={styles.slideImg}
                draggable={false}
              />
            </div>
          )
        })}
      </div>

      {/* Client label */}
      <div className={styles.labelWrap}>
        <span className={`${styles.clientLabel} ${labelVisible ? styles.labelUp : ''}`}>
          {clientLabel}
        </span>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => { setPaused(true); goTo(i) }}
            />
          ))}
        </div>
        <div className={styles.arrows}>
          <button className={styles.arrow} onClick={() => { setPaused(true); prevSlide() }}>←</button>
          <button className={styles.arrow} onClick={() => { setPaused(true); nextSlide() }}>→</button>
        </div>
        <span className={styles.hint}>Drag or arrow keys</span>
      </div>
    </section>
  )
}
