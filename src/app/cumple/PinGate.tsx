'use client'

import { useState, useRef } from 'react'
import styles from './pin.module.css'

interface Props {
  onUnlock: (pin: string) => boolean
}

export default function PinGate({ onUnlock }: Props) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)
  const ref0 = useRef<HTMLInputElement>(null)
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const ref3 = useRef<HTMLInputElement>(null)
  const refs = [ref0, ref1, ref2, ref3]

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(false)

    if (digit && index < 3) {
      refs[index + 1].current?.focus()
    }

    if (next.every(d => d !== '')) {
      const pin = next.join('')
      const ok = onUnlock(pin)
      if (!ok) {
        setShaking(true)
        setError(true)
        setTimeout(() => {
          setShaking(false)
          setDigits(['', '', '', ''])
          refs[0].current?.focus()
        }, 600)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  const SPARKLE_POSITIONS = [
    { top: '8%',  left: '15%',  delay: '0s' },
    { top: '12%', left: '70%',  delay: '0.3s' },
    { top: '22%', left: '88%',  delay: '0.6s' },
    { top: '35%', left: '5%',   delay: '0.9s' },
    { top: '60%', left: '92%',  delay: '1.2s' },
    { top: '75%', left: '20%',  delay: '1.5s' },
    { top: '85%', left: '78%',  delay: '1.8s' },
    { top: '90%', left: '42%',  delay: '2.1s' },
    { top: '15%', left: '42%',  delay: '2.4s' },
    { top: '50%', left: '2%',   delay: '2.7s' },
    { top: '45%', left: '97%',  delay: '0.15s' },
    { top: '70%', left: '55%',  delay: '0.45s' },
  ]

  return (
    <div className={styles.overlay}>
      {/* Floating Roman numerals */}
      <span className={`${styles.floatingRoman} ${styles.r1}`}>XXXV</span>
      <span className={`${styles.floatingRoman} ${styles.r2}`}>I</span>
      <span className={`${styles.floatingRoman} ${styles.r3}`}>XIX</span>
      <span className={`${styles.floatingRoman} ${styles.r4}`}>XCI</span>
      <span className={`${styles.floatingRoman} ${styles.r5}`}>MMI</span>

      {/* Sparkles */}
      {SPARKLE_POSITIONS.map((pos, i) => (
        <span
          key={i}
          className={styles.sparkle}
          style={{ top: pos.top, left: pos.left, animationDelay: pos.delay }}
        >
          ✦
        </span>
      ))}

      {/* Main frame */}
      <div className={`${styles.frame} ${shaking ? styles.shake : ''}`}>
        <span className={`${styles.corner} ${styles.tl}`} />
        <span className={`${styles.corner} ${styles.tr}`} />
        <span className={`${styles.corner} ${styles.bl}`} />
        <span className={`${styles.corner} ${styles.br}`} />

        <div className={styles.inner}>
          <p className={styles.topLabel}>ACCESO PRIVADO</p>

          <div className={styles.divider}><span>✦</span></div>

          <p className={styles.bigNumber}>35</p>
          <p className={styles.years}>años de Guido</p>

          <div className={styles.divider}><span>—</span></div>

          <p className={styles.prompt}>ingresá el código de invitación</p>

          <div className={styles.inputs}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                className={`${styles.digit} ${error ? styles.digitError : ''}`}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
                aria-label={`Dígito ${i + 1} del PIN`}
              />
            ))}
          </div>

          {error && <p className={styles.errorMsg}>código incorrecto</p>}

          <p className={styles.bottomOrnament}>⊱ ─────────── ⊰</p>
        </div>
      </div>
    </div>
  )
}
