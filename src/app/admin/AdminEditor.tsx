'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './admin.module.css'
import type { Lang } from '@/lib/getLang'
import type {
  CvContent,
  CvEntry,
  CvSkillGroup,
  CvTextItem,
  LocalizedString,
  PendingImage,
  SiteContent,
  Slide,
  TranslationCopy,
} from '@/lib/admin/contentTypes'

type CvEntrySection = 'experience' | 'education'
type CvTextSection = 'languages' | 'volunteering'
type AdminTab = 'site' | 'work' | 'cv' | 'contact'

function slugifyFileName(file: File) {
  const lastDot = file.name.lastIndexOf('.')
  const rawName = lastDot > -1 ? file.name.slice(0, lastDot) : file.name
  const extension = lastDot > -1 ? file.name.slice(lastDot).toLowerCase() : ''
  const safeName = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `${safeName || 'imagen'}-${Date.now()}${extension}`
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

function emptyLocalizedString(): LocalizedString {
  return { en: '', es: '' }
}

function createCvEntry(section: CvEntrySection): CvEntry {
  return {
    id: makeId(section),
    title: emptyLocalizedString(),
    organization: emptyLocalizedString(),
    period: emptyLocalizedString(),
    description: emptyLocalizedString(),
  }
}

function createCvSkillGroup(): CvSkillGroup {
  return {
    id: makeId('skill'),
    title: emptyLocalizedString(),
    items: [emptyLocalizedString()],
  }
}

function createCvTextItem(section: CvTextSection): CvTextItem {
  return {
    id: makeId(section),
    text: emptyLocalizedString(),
  }
}

export default function AdminEditor({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter()
  const [content, setContent] = useState<SiteContent>(initialContent)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [activeTab, setActiveTab] = useState<AdminTab>('site')
  const [activeLang, setActiveLang] = useState<Lang>('es')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateCopy(lang: Lang, key: keyof TranslationCopy, value: string | string[]) {
    setContent((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [lang]: {
          ...current.translations[lang],
          [key]: value,
        },
      },
    }))
  }

  function updateSlide(index: number, patch: Partial<Slide>) {
    setContent((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    }))
  }

  async function handleImageChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const fileName = slugifyFileName(file)
    const imagePath = `/images/${fileName}`
    const dataUrl = await readFileAsDataUrl(file)

    setPendingImages((current) => [...current, { path: imagePath, dataUrl }])
    updateSlide(index, { img: imagePath })
  }

  function addSlide() {
    setContent((current) => ({
      ...current,
      slides: [...current.slides, { client: 'NUEVO CLIENTE', img: '/images/Messi.png' }],
    }))
  }

  function removeSlide(index: number) {
    setContent((current) => ({
      ...current,
      slides: current.slides.filter((_, slideIndex) => slideIndex !== index),
    }))
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= content.slides.length) return

    setContent((current) => {
      const nextSlides = [...current.slides]
      const [slide] = nextSlides.splice(index, 1)
      nextSlides.splice(target, 0, slide)

      return { ...current, slides: nextSlides }
    })
  }

  function updateCv(patch: (cv: CvContent) => CvContent) {
    setContent((current) => ({ ...current, cv: patch(current.cv) }))
  }

  function updateCvProfile(field: keyof Omit<CvContent['profile'], 'title'>, value: string) {
    updateCv((cv) => ({
      ...cv,
      profile: {
        ...cv.profile,
        [field]: value,
      },
    }))
  }

  function updateCvProfileTitle(lang: Lang, value: string) {
    updateCv((cv) => ({
      ...cv,
      profile: {
        ...cv.profile,
        title: {
          ...cv.profile.title,
          [lang]: value,
        },
      },
    }))
  }

  function updateCvEntry(
    section: CvEntrySection,
    index: number,
    field: keyof Omit<CvEntry, 'id'>,
    lang: Lang,
    value: string,
  ) {
    updateCv((cv) => ({
      ...cv,
      [section]: cv[section].map((entry, entryIndex) =>
        entryIndex === index
          ? {
              ...entry,
              [field]: {
                ...entry[field],
                [lang]: value,
              },
            }
          : entry,
      ),
    }))
  }

  function addCvEntry(section: CvEntrySection) {
    updateCv((cv) => ({
      ...cv,
      [section]: [...cv[section], createCvEntry(section)],
    }))
  }

  function removeCvEntry(section: CvEntrySection, index: number) {
    updateCv((cv) => ({
      ...cv,
      [section]: cv[section].filter((_, entryIndex) => entryIndex !== index),
    }))
  }

  function moveCvEntry(section: CvEntrySection, index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= content.cv[section].length) return

    updateCv((cv) => {
      const nextItems = [...cv[section]]
      const [item] = nextItems.splice(index, 1)
      nextItems.splice(target, 0, item)

      return { ...cv, [section]: nextItems }
    })
  }

  function updateCvSkillTitle(index: number, lang: Lang, value: string) {
    updateCv((cv) => ({
      ...cv,
      skills: cv.skills.map((group, groupIndex) =>
        groupIndex === index
          ? {
              ...group,
              title: {
                ...group.title,
                [lang]: value,
              },
            }
          : group,
      ),
    }))
  }

  function updateCvSkillItem(groupIndex: number, itemIndex: number, lang: Lang, value: string) {
    updateCv((cv) => ({
      ...cv,
      skills: cv.skills.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              items: group.items.map((item, currentItemIndex) =>
                currentItemIndex === itemIndex ? { ...item, [lang]: value } : item,
              ),
            }
          : group,
      ),
    }))
  }

  function addCvSkillGroup() {
    updateCv((cv) => ({ ...cv, skills: [...cv.skills, createCvSkillGroup()] }))
  }

  function removeCvSkillGroup(index: number) {
    updateCv((cv) => ({ ...cv, skills: cv.skills.filter((_, groupIndex) => groupIndex !== index) }))
  }

  function addCvSkillItem(groupIndex: number) {
    updateCv((cv) => ({
      ...cv,
      skills: cv.skills.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? { ...group, items: [...group.items, emptyLocalizedString()] }
          : group,
      ),
    }))
  }

  function removeCvSkillItem(groupIndex: number, itemIndex: number) {
    updateCv((cv) => ({
      ...cv,
      skills: cv.skills.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? { ...group, items: group.items.filter((_, currentItemIndex) => currentItemIndex !== itemIndex) }
          : group,
      ),
    }))
  }

  function updateCvTextItem(section: CvTextSection, index: number, lang: Lang, value: string) {
    updateCv((cv) => ({
      ...cv,
      [section]: cv[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, text: { ...item.text, [lang]: value } } : item,
      ),
    }))
  }

  function addCvTextItem(section: CvTextSection) {
    updateCv((cv) => ({ ...cv, [section]: [...cv[section], createCvTextItem(section)] }))
  }

  function removeCvTextItem(section: CvTextSection, index: number) {
    updateCv((cv) => ({
      ...cv,
      [section]: cv[section].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  async function handleSave() {
    setSaving(true)
    setStatus('')
    setError('')

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, images: pendingImages }),
      })
      const responseText = await response.text()
      let data: { message?: string; content?: SiteContent } = {}

      if (responseText) {
        try {
          data = JSON.parse(responseText) as { message?: string; content?: SiteContent }
        } catch {
          data = {}
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No se pudo guardar porque la API del admin no está disponible en este deploy.')
        }

        throw new Error(data.message || `No se pudo guardar. Error ${response.status}.`)
      }

      if (data.content) {
        setContent(data.content)
      }
      setPendingImages([])
      setStatus('Cambios guardados.')
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  function renderCopyField(
    key: keyof Omit<TranslationCopy, 'marquee'>,
    label: string,
    options: { multiline?: boolean; wide?: boolean } = {},
  ) {
    return (
      <label className={`${styles.field} ${options.wide ? styles.fieldWide : ''}`}>
        <span>{label}</span>
        {options.multiline ? (
          <textarea
            value={content.translations[activeLang][key]}
            onChange={(event) => updateCopy(activeLang, key, event.target.value)}
          />
        ) : (
          <input
            value={content.translations[activeLang][key]}
            onChange={(event) => updateCopy(activeLang, key, event.target.value)}
          />
        )}
      </label>
    )
  }

  function renderLangTabs() {
    return (
      <div className={styles.segmented}>
        {(['es', 'en'] as Lang[]).map((lang) => (
          <button
            key={lang}
            className={activeLang === lang ? styles.segmentActive : ''}
            onClick={() => setActiveLang(lang)}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  function renderCvLocalizedField(
    label: string,
    value: LocalizedString,
    onChange: (lang: Lang, value: string) => void,
    options: { multiline?: boolean; wide?: boolean } = {},
  ) {
    return (
      <div className={`${styles.localizedField} ${options.wide ? styles.fieldWide : ''}`}>
        <span>{label}</span>
        <div className={styles.localizedColumns}>
          {(['es', 'en'] as Lang[]).map((lang) => (
            <label className={styles.localizedColumn} key={lang}>
              <small>{lang.toUpperCase()}</small>
              {options.multiline ? (
                <textarea value={value[lang]} onChange={(event) => onChange(lang, event.target.value)} />
              ) : (
                <input value={value[lang]} onChange={(event) => onChange(lang, event.target.value)} />
              )}
            </label>
          ))}
        </div>
      </div>
    )
  }

  function renderCvEntrySection(section: CvEntrySection, title: string, kicker: string) {
    return (
      <div className={styles.cvBlock}>
        <div className={styles.cvBlockHeader}>
          <div>
            <p className={styles.kicker}>{kicker}</p>
            <h3>{title}</h3>
          </div>
          <button
            className={styles.iconAddButton}
            onClick={() => addCvEntry(section)}
            aria-label={`Agregar ${title}`}
            title={`Agregar ${title}`}
          >
            +
          </button>
        </div>
        <div className={styles.cvList}>
          {content.cv[section].map((entry, index) => (
            <article className={styles.cvCard} key={entry.id}>
              <div className={styles.cvFields}>
                {renderCvLocalizedField('Cargo / título', entry.title, (lang, value) =>
                  updateCvEntry(section, index, 'title', lang, value),
                )}
                {renderCvLocalizedField('Organización / detalle', entry.organization, (lang, value) =>
                  updateCvEntry(section, index, 'organization', lang, value),
                )}
                {renderCvLocalizedField('Período', entry.period, (lang, value) =>
                  updateCvEntry(section, index, 'period', lang, value),
                )}
                {renderCvLocalizedField(
                  'Descripción',
                  entry.description,
                  (lang, value) => updateCvEntry(section, index, 'description', lang, value),
                  { multiline: true, wide: true },
                )}
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => moveCvEntry(section, index, -1)} disabled={index === 0}>
                  ↑
                </button>
                <button
                  onClick={() => moveCvEntry(section, index, 1)}
                  disabled={index === content.cv[section].length - 1}
                >
                  ↓
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => removeCvEntry(section, index)}
                  aria-label={`Eliminar ${title}`}
                  title={`Eliminar ${title}`}
                >
                  X
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  function renderCvTextSection(section: CvTextSection, title: string, kicker: string) {
    return (
      <div className={styles.cvBlock}>
        <div className={styles.cvBlockHeader}>
          <div>
            <p className={styles.kicker}>{kicker}</p>
            <h3>{title}</h3>
          </div>
          <button
            className={styles.iconAddButton}
            onClick={() => addCvTextItem(section)}
            aria-label={`Agregar ${title}`}
            title={`Agregar ${title}`}
          >
            +
          </button>
        </div>
        <div className={styles.cvList}>
          {content.cv[section].map((item, index) => (
            <article className={styles.cvInlineCard} key={item.id}>
              {renderCvLocalizedField('Texto', item.text, (lang, value) =>
                updateCvTextItem(section, index, lang, value),
              )}
              <div className={styles.cardActions}>
                <button
                  className={styles.deleteButton}
                  onClick={() => removeCvTextItem(section, index)}
                  aria-label={`Eliminar ${title}`}
                  title={`Eliminar ${title}`}
                >
                  X
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/" target="_blank" rel="noreferrer">
          GUID<span>O</span> WAIN
        </a>
        <nav className={styles.navList}>
          <button
            className={activeTab === 'site' ? styles.navActive : ''}
            onClick={() => setActiveTab('site')}
          >
            Home
          </button>
          <button
            className={activeTab === 'work' ? styles.navActive : ''}
            onClick={() => setActiveTab('work')}
          >
            Trabajos
          </button>
          <button
            className={activeTab === 'cv' ? styles.navActive : ''}
            onClick={() => setActiveTab('cv')}
          >
            CV
          </button>
          <button
            className={activeTab === 'contact' ? styles.navActive : ''}
            onClick={() => setActiveTab('contact')}
          >
            Contacto
          </button>
        </nav>
        <button className={styles.ghostButton} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Panel de administración</p>
            <h1>{activeTab === 'cv' ? 'Curriculum vitae' : 'Contenido del sitio'}</h1>
          </div>
          <button className={styles.primaryButton} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </header>

        {status && <p className={styles.success}>{status}</p>}
        {error && <p className={styles.error}>{error}</p>}

        {activeTab === 'site' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Home</p>
              <h2>Textos principales</h2>
            </div>
            {renderLangTabs()}
          </div>

          <div className={styles.contentGroups}>
            <div className={styles.contentGroup}>
              <div className={styles.groupIntro}>
                <h3>Nav y hero</h3>
                <p>Lo primero que se ve arriba del sitio.</p>
              </div>
              <div className={styles.groupGrid}>
                {renderCopyField('navContact', 'Botón de navegación')}
                {renderCopyField('heroSub', 'Bajada principal')}
                {renderCopyField('heroDesc', 'Descripción hero', { multiline: true, wide: true })}
              </div>
            </div>

            <div className={styles.contentGroup}>
              <div className={styles.groupIntro}>
                <h3>About</h3>
                <p>Título grande y texto biográfico.</p>
              </div>
              <div className={styles.groupGrid}>
                {renderCopyField('aboutLine1', 'Título línea 1')}
                {renderCopyField('aboutLine2', 'Título línea 2')}
                {renderCopyField('aboutBody1', 'Párrafo 1', { multiline: true })}
                {renderCopyField('aboutBody2', 'Párrafo 2', { multiline: true })}
              </div>
            </div>

            <div className={styles.contentGroup}>
              <div className={styles.groupIntro}>
                <h3>Contacto</h3>
                <p>El titular del bloque final.</p>
              </div>
              <div className={styles.groupGridThree}>
                {renderCopyField('contactLine1', 'Línea 1')}
                {renderCopyField('contactLine2', 'Línea 2')}
                {renderCopyField('contactLine3', 'Línea 3')}
              </div>
            </div>

            <div className={styles.contentGroup}>
              <div className={styles.groupIntro}>
                <h3>Footer y marquee</h3>
                <p>Datos de cierre y lista animada de servicios.</p>
              </div>
              <div className={styles.groupGrid}>
                {renderCopyField('footerLocation', 'Ubicación footer')}
                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span>Marquee, una línea por ítem</span>
                  <textarea
                    value={content.translations[activeLang].marquee.join('\n')}
                    onChange={(event) =>
                      updateCopy(
                        activeLang,
                        'marquee',
                        event.target.value.split('\n').filter(Boolean),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
        )}

        {activeTab === 'work' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Portfolio</p>
              <h2>Trabajos del carrusel</h2>
            </div>
            <button
              className={styles.iconAddButton}
              onClick={addSlide}
              aria-label="Agregar trabajo"
              title="Agregar trabajo"
            >
              +
            </button>
          </div>

          <div className={styles.slideList}>
            {content.slides.map((slide, index) => (
              <article className={styles.slideCard} key={`${slide.img}-${index}`}>
                <img src={slide.img} alt="" />
                <div className={styles.slideFields}>
                  <label className={styles.field}>
                    <span>Cliente</span>
                    <input
                      value={slide.client}
                      onChange={(event) => updateSlide(index, { client: event.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Ruta de imagen</span>
                    <input
                      value={slide.img}
                      onChange={(event) => updateSlide(index, { img: event.target.value })}
                    />
                  </label>
                  <label className={styles.uploadButton}>
                    Subir foto
                    <input type="file" accept="image/*,.gif" onChange={(event) => handleImageChange(index, event)} />
                  </label>
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => moveSlide(index, -1)} disabled={index === 0}>
                    ↑
                  </button>
                  <button onClick={() => moveSlide(index, 1)} disabled={index === content.slides.length - 1}>
                    ↓
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => removeSlide(index)}
                    aria-label="Eliminar trabajo"
                    title="Eliminar trabajo"
                  >
                    X
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {activeTab === 'cv' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>CV</p>
              <h2>Curriculum vitae</h2>
            </div>
          </div>

          <div className={styles.contentGroups}>
            <div className={styles.contentGroup}>
              <div className={styles.groupIntro}>
                <h3>Perfil</h3>
                <p>Datos generales que después van a alimentar la página y el PDF.</p>
              </div>
              <div className={styles.groupGrid}>
                <label className={styles.field}>
                  <span>Nombre</span>
                  <input
                    value={content.cv.profile.name}
                    onChange={(event) => updateCvProfile('name', event.target.value)}
                  />
                </label>
                {renderCvLocalizedField('Título profesional', content.cv.profile.title, updateCvProfileTitle)}
                <label className={styles.field}>
                  <span>Ubicación</span>
                  <input
                    value={content.cv.profile.location}
                    onChange={(event) => updateCvProfile('location', event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Teléfono</span>
                  <input
                    value={content.cv.profile.phone}
                    onChange={(event) => updateCvProfile('phone', event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    value={content.cv.profile.email}
                    onChange={(event) => updateCvProfile('email', event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Web</span>
                  <input
                    value={content.cv.profile.website}
                    onChange={(event) => updateCvProfile('website', event.target.value)}
                  />
                </label>
              </div>
            </div>

            {renderCvEntrySection('experience', 'Experiencia', 'Secciones ordenables')}

            <div className={styles.cvBlock}>
              <div className={styles.cvBlockHeader}>
                <div>
                  <p className={styles.kicker}>Skills</p>
                  <h3>Habilidades</h3>
                </div>
                <button
                  className={styles.iconAddButton}
                  onClick={addCvSkillGroup}
                  aria-label="Agregar grupo de habilidades"
                  title="Agregar grupo de habilidades"
                >
                  +
                </button>
              </div>
              <div className={styles.cvList}>
                {content.cv.skills.map((group, groupIndex) => (
                  <article className={styles.cvCard} key={group.id}>
                    <div className={styles.cvFields}>
                      {renderCvLocalizedField(
                        'Grupo',
                        group.title,
                        (lang, value) => updateCvSkillTitle(groupIndex, lang, value),
                        { wide: true },
                      )}
                      <div className={`${styles.field} ${styles.fieldWide}`}>
                        <span>Items</span>
                        <div className={styles.skillItems}>
                          {group.items.map((item, itemIndex) => (
                            <div className={styles.skillItem} key={`${group.id}-${itemIndex}`}>
                              <div className={styles.localizedColumns}>
                                {(['es', 'en'] as Lang[]).map((lang) => (
                                  <label className={styles.localizedColumn} key={lang}>
                                    <small>{lang.toUpperCase()}</small>
                                    <input
                                      value={item[lang]}
                                      onChange={(event) =>
                                        updateCvSkillItem(groupIndex, itemIndex, lang, event.target.value)
                                      }
                                    />
                                  </label>
                                ))}
                              </div>
                              <button
                                className={styles.deleteButton}
                                onClick={() => removeCvSkillItem(groupIndex, itemIndex)}
                                aria-label="Eliminar habilidad"
                                title="Eliminar habilidad"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => addCvSkillItem(groupIndex)}
                        aria-label="Agregar habilidad"
                        title="Agregar habilidad"
                      >
                        +
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => removeCvSkillGroup(groupIndex)}
                        aria-label="Eliminar grupo de habilidades"
                        title="Eliminar grupo de habilidades"
                      >
                        X
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {renderCvEntrySection('education', 'Educación', 'Formación')}
            {renderCvTextSection('languages', 'Idiomas', 'Lista simple')}
            {renderCvTextSection('volunteering', 'Voluntariado', 'Lista simple')}
          </div>
        </section>
        )}

        {activeTab === 'contact' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Ajustes</p>
              <h2>Contacto y redes</h2>
            </div>
          </div>

          <div className={styles.formGrid}>
            {Object.entries(content.contact).map(([key, value]) => (
              <label className={styles.field} key={key}>
                <span>{key}</span>
                <input
                  value={value}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      contact: { ...current.contact, [key]: event.target.value },
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </section>
        )}
      </section>
    </main>
  )
}
