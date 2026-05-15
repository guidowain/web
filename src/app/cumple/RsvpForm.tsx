'use client'

import { useState } from 'react'
import { submitRsvp } from '../../lib/rsvp'
import styles from './cumple.module.css'

const VIENE_OPTIONS = ['Sí', 'No', 'Tal vez']
const HORARIO_OPTIONS = ['21h', '22h', '23h', 'después de medianoche']
const LLEVA_OPTIONS = ['nada', 'algo para tomar', 'postre', 'me sorprendo en el momento']

export default function RsvpForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    viene: '',
    cuantos: '1',
    restriccion: '',
    horario: '',
    lleva: '',
  })

  const set = (key: keyof typeof form, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await submitRsvp(form)
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <section className={styles.rsvp}>
        <div className={styles.rsvpInner}>
          <p className={styles.thanks}>¡Gracias! Te espero. 🎂</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.rsvp}>
      <div className={styles.rsvpInner}>
        <h2 className={styles.sectionTitle}>¿Venís?</h2>
        <p className={styles.sectionSubtitle}>confirmame para tener todo listo</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.fieldLabel}>
            <span>nombre</span>
            <input
              className={styles.input}
              type="text"
              required
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="tu nombre"
            />
          </label>

          <div className={styles.fieldLabel}>
            <span>¿venís?</span>
            <div className={styles.options}>
              {VIENE_OPTIONS.map(o => (
                <button
                  key={o}
                  type="button"
                  className={`${styles.option} ${form.viene === o ? styles.optionActive : ''}`}
                  onClick={() => set('viene', o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.fieldLabel}>
            <span>¿cuántos vienen?</span>
            <input
              className={`${styles.input} ${styles.inputNarrow}`}
              type="number"
              min="1"
              max="10"
              value={form.cuantos}
              onChange={e => set('cuantos', e.target.value)}
            />
          </label>

          <label className={styles.fieldLabel}>
            <span>restricción alimentaria <em>(opcional)</em></span>
            <input
              className={styles.input}
              type="text"
              value={form.restriccion}
              onChange={e => set('restriccion', e.target.value)}
              placeholder="vegetariano, celíaco..."
            />
          </label>

          <div className={styles.fieldLabel}>
            <span>¿a qué hora llegás?</span>
            <div className={styles.options}>
              {HORARIO_OPTIONS.map(o => (
                <button
                  key={o}
                  type="button"
                  className={`${styles.option} ${form.horario === o ? styles.optionActive : ''}`}
                  onClick={() => set('horario', o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldLabel}>
            <span>¿qué llevás?</span>
            <div className={styles.options}>
              {LLEVA_OPTIONS.map(o => (
                <button
                  key={o}
                  type="button"
                  className={`${styles.option} ${form.lleva === o ? styles.optionActive : ''}`}
                  onClick={() => set('lleva', o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={loading || !form.viene || !form.horario || !form.lleva || !form.nombre}
          >
            {loading ? 'enviando...' : 'confirmar asistencia'}
          </button>
        </form>
      </div>
    </section>
  )
}
