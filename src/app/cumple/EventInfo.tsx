'use client'

import styles from './cumple.module.css'

// TODO: completar hora y dirección cuando los tengas
const EVENT = {
  date: 'Viernes 5 de junio de 2026',
  time: 'Hora a confirmar',          // TODO: ej. '21:00 hs'
  address: 'Dirección a confirmar',   // TODO: ej. 'Av. Corrientes 1234, CABA'
  mapsEmbedUrl: '',                   // TODO: URL embed de Google Maps
}

function downloadIcs() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cumple Guido//ES',
    'BEGIN:VEVENT',
    'DTSTART:20260605T210000',
    'DTEND:20260606T030000',
    'SUMMARY:Cumple de Guido 🎂',
    `LOCATION:${EVENT.address}`,
    'DESCRIPTION:35 años. Una noche para celebrar.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cumple-guido-35.ics'
  a.click()
  URL.revokeObjectURL(url)
}

function googleCalUrl() {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Cumple de Guido 🎂',
    dates: '20260605T210000/20260606T030000',
    details: '35 años. Una noche para celebrar.',
    location: EVENT.address,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default function EventInfo() {
  return (
    <section className={styles.eventInfo}>
      <div className={styles.eventInner}>
        <h2 className={styles.sectionTitle}>el evento</h2>
        <p className={styles.sectionSubtitle}>marcalo en el calendario</p>

        <div className={styles.eventDetails}>
          <div className={styles.eventRow}>
            <span className={styles.eventIcon}>📅</span>
            <p className={styles.eventValue}>{EVENT.date}</p>
          </div>
          <div className={styles.eventRow}>
            <span className={styles.eventIcon}>🕐</span>
            <p className={styles.eventValue}>{EVENT.time}</p>
          </div>
          <div className={styles.eventRow}>
            <span className={styles.eventIcon}>📍</span>
            <p className={styles.eventValue}>{EVENT.address}</p>
          </div>
        </div>

        {EVENT.mapsEmbedUrl && (
          <div className={styles.mapContainer}>
            <iframe
              src={EVENT.mapsEmbedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del evento"
            />
          </div>
        )}

        <div className={styles.calButtons}>
          <button className={styles.calBtn} onClick={downloadIcs}>
            Descargar .ics
          </button>
          <a
            className={styles.calBtn}
            href={googleCalUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Calendar
          </a>
        </div>
      </div>
    </section>
  )
}
