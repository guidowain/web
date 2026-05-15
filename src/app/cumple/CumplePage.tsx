'use client'

import { useState, useEffect } from 'react'
import PinGate from './PinGate'
import Slideshow from './Slideshow'
import RsvpForm from './RsvpForm'
import EventInfo from './EventInfo'
import styles from './cumple.module.css'

const PIN = '1991'

export default function CumplePage() {
  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('cumple-pin') === PIN) {
      setUnlocked(true)
    }
    setChecking(false)
  }, [])

  const handlePin = (pin: string): boolean => {
    if (pin === PIN) {
      sessionStorage.setItem('cumple-pin', PIN)
      setUnlocked(true)
      return true
    }
    return false
  }

  if (checking) return null
  if (!unlocked) return <PinGate onUnlock={handlePin} />

  return (
    <main className={styles.main}>
      <Slideshow />

      <section className={styles.welcome}>
        <div className={styles.welcomeInner}>
          {/* TODO: reemplazar con el texto de bienvenida (rosa cringe) */}
          <p className={styles.welcomePlaceholder}>[TEXTO BIENVENIDA — A ESCRIBIR]</p>
        </div>
      </section>

      <RsvpForm />
      <EventInfo />
    </main>
  )
}
