'use client'

import { useEffect, useState } from 'react'
import type { CvEntry, CvTextItem, SiteContent } from '@/lib/admin/contentTypes'
import type { Lang } from '@/lib/getLang'
import styles from './cv.module.css'

type SectionCopy = {
  about: string
  experience: string
  skills: string
  education: string
  languages: string
  volunteering: string
  contact: string
  download: string
  portfolio: string
  available: string
}

const sectionCopy: Record<Lang, SectionCopy> = {
  en: {
    about: 'About',
    experience: 'Experience',
    skills: 'Toolkit',
    education: 'Education',
    languages: 'Languages',
    volunteering: 'Volunteering',
    contact: 'Contact',
    download: 'Download PDF',
    portfolio: 'Portfolio',
    available: 'Available worldwide',
  },
  es: {
    about: 'Sobre mi',
    experience: 'Experiencia',
    skills: 'Herramientas',
    education: 'Educacion',
    languages: 'Idiomas',
    volunteering: 'Voluntariado',
    contact: 'Contacto',
    download: 'Descargar PDF',
    portfolio: 'Portfolio',
    available: 'Disponible worldwide',
  },
}

function getBrowserLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  return window.navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function formatRole(title: string, organization: string) {
  return organization ? `${title} · ${organization}` : title
}

function splitCommaText(value: string) {
  const [title, ...rest] = value.split(',')
  return {
    title: title.trim(),
    detail: rest.join(',').trim(),
  }
}

function CvEntryList({ entries, lang, compact = false }: { entries: CvEntry[]; lang: Lang; compact?: boolean }) {
  return (
    <div className={styles.entryList}>
      {entries.map((entry) => (
        <article className={styles.entry} key={entry.id}>
          <p className={styles.entryRole}>{formatRole(entry.title[lang], entry.organization[lang])}</p>
          <p className={styles.entryPeriod}>{entry.period[lang]}</p>
          {entry.description[lang] && !compact && <p className={styles.entryDescription}>{entry.description[lang]}</p>}
        </article>
      ))}
    </div>
  )
}

function MiniTextList({ items, lang }: { items: CvTextItem[]; lang: Lang }) {
  return (
    <div className={styles.miniList}>
      {items.map((item) => {
        const { title, detail } = splitCommaText(item.text[lang])
        return (
          <article className={styles.miniItem} key={item.id}>
            <p>{title}</p>
            {detail && <span>{detail}</span>}
          </article>
        )
      })}
    </div>
  )
}

export default function CvView({ content }: { content: SiteContent }) {
  const [lang, setLang] = useState<Lang>('en')
  const copy = sectionCopy[lang]
  const cv = content.cv

  useEffect(() => {
    setLang(getBrowserLang())
  }, [])

  const highlightedSkillId = cv.skills.find((group) => group.id.includes('ai'))?.id

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <a className={styles.brand} href="/">
          GUID<span>O</span> WAIN
        </a>
        <div className={styles.navActions}>
          <div className={styles.langSwitch} aria-label="Language">
            {(['es', 'en'] as Lang[]).map((item) => (
              <button key={item} className={lang === item ? styles.activeLang : ''} onClick={() => setLang(item)}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <button className={styles.printButton} onClick={() => window.print()}>
            {copy.download}
          </button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>{copy.available}</p>
          <h1>{cv.profile.name}</h1>
        </div>
        <div className={styles.heroSide}>
          <p>{cv.profile.title[lang]}</p>
          <div className={styles.contactRows}>
            <span>{cv.profile.location}</span>
            <a href={`mailto:${cv.profile.email}`}>{cv.profile.email}</a>
            <a href={`tel:${cv.profile.phone.replace(/\s/g, '')}`}>{cv.profile.phone}</a>
            <a href={`https://${cv.profile.website}`}>{copy.portfolio}</a>
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <p>{cv.profile.summary[lang]}</p>
      </section>

      <section className={styles.block}>
        <div className={styles.sectionHead}>
          <span>01</span>
          <h2>{copy.experience}</h2>
        </div>
        <CvEntryList entries={cv.experience} lang={lang} />
      </section>

      <section className={styles.block}>
        <div className={styles.sectionHead}>
          <span>02</span>
          <h2>{copy.skills}</h2>
        </div>
        <div className={styles.skillStack}>
          {cv.skills.map((group) => (
            <article className={styles.skillGroup} key={group.id}>
              <h3>{group.title[lang]}</h3>
              <div>
                {group.items.map((item) => (
                  <span className={group.id === highlightedSkillId ? styles.skillAi : ''} key={item.en}>
                    {item[lang]}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.block} ${styles.bottomGrid}`}>
        <div>
          <div className={styles.sectionHead}>
            <span>03</span>
            <h2>{copy.education}</h2>
          </div>
          <div className={styles.miniList}>
            {cv.education.map((entry) => (
              <article className={styles.miniItem} key={entry.id}>
                <p>{entry.organization[lang]}</p>
                <span>{entry.title[lang]}</span>
                <small>{entry.period[lang]}</small>
              </article>
            ))}
          </div>
        </div>
        <div>
          <div className={styles.sectionHead}>
            <span>04</span>
            <h2>{copy.languages}</h2>
          </div>
          <MiniTextList items={cv.languages} lang={lang} />
          <div className={styles.sectionHead}>
            <span>05</span>
            <h2>{copy.volunteering}</h2>
          </div>
          <MiniTextList items={cv.volunteering} lang={lang} />
        </div>
      </section>

      <section className={styles.cta}>
        <h2>{copy.contact}</h2>
        <div>
          <a href={`mailto:${cv.profile.email}`}>{cv.profile.email}</a>
          <a href={`tel:${cv.profile.phone.replace(/\s/g, '')}`}>{cv.profile.phone}</a>
          <a href="/">{copy.portfolio}</a>
        </div>
      </section>
    </main>
  )
}
