'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import styles from './carousel.module.css'
import type { Slide } from '@/lib/admin/contentTypes'

const AUTOPLAY_MS = 3000

export default function Carousel({ slides }: { slides: Slide[] }) {
  const initialClient = slides[0]?.client || ''
  const [current, setCurrent]               = useState(0)
  const [prev, setPrev]                     = useState<number | null>(null)
  const [animating, setAnimating]           = useState(false)
  const [clientLabel, setClientLabel]       = useState(initialClient)
  const [labelVisible, setLabelVisible]     = useState(false)
  const [clientBg, setClientBg]             = useState(initialClient)
  const [clientBgShow, setClientBgShow]     = useState(true)
  const [paused, setPaused]                 = useState(false)
  const [progressKey, setProgressKey]       = useState(0)
  const dragStart = useRef<number | null>(null)

  // Initial label reveal
  useEffect(() => {
    if (slides.length === 0) return
    const t = setTimeout(() => setLabelVisible(true), 600)
    return () => clearTimeout(t)
  }, [slides.length])

  const goTo = useCallback((idx: number) => {
    if (!slides[idx]) return
    if (animating || idx === current) return
    setAnimating(true)
    setPrev(current)

    // bg text flicker out/in
    setClientBgShow(false)
    setTimeout(() => {
      setClientBg(slides[idx].client)
      setClientBgShow(true)
    }, 200)

    // label slide
    setLabelVisible(false)
    setTimeout(() => {
      setClientLabel(slides[idx].client)
      setLabelVisible(true)
    }, 350)

    // swap after crossfade starts
    setTimeout(() => {
      setCurrent(idx)
      setPrev(null)
      setProgressKey(k => k + 1)
      setAnimating(false)
    }, 700)
  }, [animating, current, slides])

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    goTo((current + 1) % slides.length)
  }, [current, goTo, slides.length])
  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo, slides.length])

  // Autoplay
  useEffect(() => {
    if (paused || slides.length === 0) return
    const t = setTimeout(nextSlide, AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [current, paused, nextSlide, slides.length])

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === ' ') {
        e.preventDefault()
        setPaused(p => !p)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [nextSlide, prevSlide])

  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX }
  const onPointerUp   = (e: React.PointerEvent) => {
    if (dragStart.current === null) return
    const diff = dragStart.current - e.clientX
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide() }
    dragStart.current = null
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <section
      className={styles.section}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className={styles.topBar}>
        <span className={styles.sectionLabel}>Selected Work</span>
        <span className={styles.counter}>
          <span className={styles.counterCurrent}>{String(current + 1).padStart(2, '0')}</span>
          {' / '}{String(slides.length).padStart(2, '0')}
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
        {slides.map((slide, i) => {
          const isActive = i === current
          const isLeaving = i === prev
          return (
            <div
              key={i}
              className={`${styles.slide} ${isActive ? styles.slideIn : ''} ${isLeaving ? styles.slideOut : ''}`}
            >
              <Image
                src={slide.img}
                alt={slide.client}
                width={1600}
                height={1000}
                quality={80}
                sizes="(max-width: 768px) 100vw, 90vw"
                priority={i === 0}
                className={`${styles.slideImg} ${isActive ? styles.kenBurns : ''}`}
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
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <div className={styles.arrows}>
          <button className={styles.arrow} onClick={prevSlide} aria-label="Previous slide">←</button>
          <button
            className={styles.arrow}
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? 'Play autoplay' : 'Pause autoplay'}
          >
            {paused ? '▶' : '⏸'}
          </button>
          <button className={styles.arrow} onClick={nextSlide} aria-label="Next slide">→</button>
        </div>
        <span className={styles.hint}>Drag or arrow keys</span>
      </div>
    </section>
  )
}
