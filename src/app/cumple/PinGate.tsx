'use client'

import { useState, useRef } from 'react'
import styles from './pin.module.css'

interface Props {
  onUnlock: (pin: string) => boolean
}

const EMOJIS = ['🍩', '🎉', '⭐', '🎈', '🎂', '🌈', '🤪', '🍕', '🎊', '🦄', '💥', '🔥']

const EMOJI_POSITIONS = [
  { top: '5%',  left: '3%'  },
  { top: '8%',  right: '5%' },
  { top: '22%', left: '88%' },
  { top: '38%', left: '2%'  },
  { top: '55%', right: '3%' },
  { top: '70%', left: '7%'  },
  { top: '82%', right: '8%' },
  { top: '90%', left: '40%' },
  { top: '15%', left: '45%' },
  { top: '46%', left: '48%' },
  { top: '3%',  left: '60%' },
  { top: '65%', left: '75%' },
]

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

  return (
    <div className={styles.overlay}>
      {/* Floating emojis */}
      {EMOJI_POSITIONS.map((pos, i) => (
        <span
          key={i}
          className={`${styles.floatingEmoji} ${styles[`e${i}`]}`}
          style={pos}
        >
          {EMOJIS[i]}
        </span>
      ))}

      {/* Spinning rainbow border wrapper */}
      <div className={styles.frameWrapper}>
        <div className={`${styles.frame} ${shaking ? styles.shake : ''}`}>
          <div className={styles.inner}>
            <p className={styles.topLabel}>⭐ ACCESO SECRETO ⭐</p>

            <span className={styles.divider}>🍩</span>

            <p className={styles.bigNumber}>35</p>
            <p className={styles.years}>años de Guido!!</p>

            <span className={styles.divider}>🎂</span>

            <p className={styles.prompt}>🔐 ingresá el código de invitación 🔐</p>

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

            {error && <p className={styles.errorMsg}>❌ código incorrecto ❌</p>}

            <p className={styles.bottomOrnament}>🌈 ⭐ 🌈 ⭐ 🌈</p>
          </div>
        </div>
      </div>
    </div>
  )
}
