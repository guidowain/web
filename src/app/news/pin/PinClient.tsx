'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './pin.module.css'

const biometriaKey = 'news-webauthn'

function bytesToBinary(bytes: Uint8Array) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return binary
}

function toBase64Url(buffer: ArrayBuffer) {
  return btoa(bytesToBinary(new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const raw = atob(padded)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
  return bytes.buffer
}

async function biometriaDisponible() {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export function PinClient({ next }: { next: string }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [ofrecerBiometria, setOfrecerBiometria] = useState(false)
  const [botonBiometria, setBotonBiometria] = useState(false)
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    refs[0].current?.focus()
    if (localStorage.getItem(biometriaKey)) {
      biometriaDisponible().then(setBotonBiometria)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function entrar() {
    window.location.assign(next)
  }

  async function enviarPin(pin: string) {
    setVerificando(true)
    setError('')
    try {
      const response = await fetch('/api/news/desbloquear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (!response.ok) {
        setShaking(true)
        setError('PIN incorrecto')
        setTimeout(() => {
          setShaking(false)
          setDigits(['', '', '', ''])
          refs[0].current?.focus()
        }, 600)
        return
      }

      const puedeRegistrar = !localStorage.getItem(biometriaKey) && (await biometriaDisponible())
      if (puedeRegistrar) {
        setOfrecerBiometria(true)
      } else {
        entrar()
      }
    } catch {
      setError('No se pudo verificar. Probá de nuevo.')
    } finally {
      setVerificando(false)
    }
  }

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = digit
    setDigits(nextDigits)
    setError('')

    if (digit && index < 3) refs[index + 1].current?.focus()
    if (nextDigits.every((d) => d !== '')) enviarPin(nextDigits.join(''))
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  async function registrarBiometria() {
    setError('')
    try {
      const { challenge } = (await (await fetch('/api/news/webauthn')).json()) as { challenge: string }
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: fromBase64Url(challenge),
          rp: { name: 'News Brief', id: location.hostname },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'guido',
            displayName: 'Guido Wain',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null

      if (!credential) throw new Error('Registro cancelado.')

      const attestation = credential.response as AuthenticatorAttestationResponse
      const publicKey = attestation.getPublicKey?.()
      if (!publicKey) throw new Error('Este navegador no soporta el registro.')

      const guardado = await fetch('/api/news/webauthn', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: credential.id,
          publicKey: btoa(bytesToBinary(new Uint8Array(publicKey))),
          algorithm: attestation.getPublicKeyAlgorithm?.() ?? -7,
        }),
      })
      if (!guardado.ok) throw new Error('No se pudo guardar la credencial.')

      localStorage.setItem(biometriaKey, credential.id)
      entrar()
    } catch (registroError) {
      const mensaje = registroError instanceof Error ? registroError.message : ''
      // Cancelar el diálogo del sistema no es un error: seguimos de largo.
      if (mensaje.includes('cancelado') || registroError instanceof DOMException) {
        entrar()
        return
      }
      setError(mensaje || 'No se pudo activar la biometría.')
    }
  }

  async function entrarConBiometria() {
    setError('')
    try {
      const { challenge, credenciales } = (await (await fetch('/api/news/webauthn')).json()) as {
        challenge: string
        credenciales: string[]
      }

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: fromBase64Url(challenge),
          rpId: location.hostname,
          allowCredentials: credenciales.map((id) => ({ type: 'public-key' as const, id: fromBase64Url(id) })),
          userVerification: 'required',
          timeout: 60000,
        },
      })) as PublicKeyCredential | null

      if (!assertion) return

      const response = assertion.response as AuthenticatorAssertionResponse
      const verificado = await fetch('/api/news/webauthn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assertion.id,
          authenticatorData: toBase64Url(response.authenticatorData),
          clientDataJSON: toBase64Url(response.clientDataJSON),
          signature: toBase64Url(response.signature),
        }),
      })

      if (!verificado.ok) {
        setError('No se pudo verificar. Usá el PIN.')
        return
      }

      entrar()
    } catch {
      setError('Biometría cancelada. Usá el PIN.')
    }
  }

  if (ofrecerBiometria) {
    return (
      <main className={styles.screen}>
        <div className={styles.card}>
          <span className={styles.wordmark}>
            Brief<span className={styles.dot}>.</span>
          </span>
          <h1 className={styles.title}>¿Activar Face ID / Touch ID?</h1>
          <p className={styles.hint}>La próxima vez entrás sin escribir el PIN.</p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={registrarBiometria}>
              Activar
            </button>
            <button className={styles.secondary} onClick={entrar}>
              Ahora no
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </main>
    )
  }

  return (
    <main className={styles.screen}>
      <div className={`${styles.card} ${shaking ? styles.shake : ''}`}>
        <span className={styles.wordmark}>
          Brief<span className={styles.dot}>.</span>
        </span>
        <h1 className={styles.title}>Ingresá tu PIN</h1>
        <div className={styles.pinRow}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={refs[index]}
              className={styles.pinInput}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={verificando}
              onChange={(event) => handleDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
            />
          ))}
        </div>
        {botonBiometria && (
          <button className={styles.secondary} onClick={entrarConBiometria}>
            Entrar con Face ID / Touch ID
          </button>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </main>
  )
}
