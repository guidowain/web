import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import path from 'path'
import { editionMoment, type Brief, type Noticia } from './storage'

const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))
const read = (file: string) => readFileSync(path.join(process.cwd(), 'public', file), 'utf8')
const script = read('brief-client.js')
const dialog = read('brief-feedback.html')
const zone = 'America/Argentina/Buenos_Aires'

const labels: Record<string, string> = {
  AI: 'IA', Apple: 'Apple', Finance: 'Finanzas', Argentina: 'Argentina', Marketing: 'Marketing', Business: 'Negocios',
  'Tools & Automation': 'Herramientas', Market: 'Mercados', Markets: 'Mercados', Investing: 'Inversiones', Regulatory: 'Regulación',
  Technology: 'Tecnología', Tech: 'Tecnología', Automation: 'Automatización', Productivity: 'Productividad', Platform: 'Plataformas',
  Product: 'Producto', Privacy: 'Privacidad', Design: 'Diseño', Photography: 'Fotografía', Photo: 'Fotografía', World: 'Mundo',
  Science: 'Ciencia', Crypto: 'Cripto', Startups: 'Startups', Economy: 'Economía', Politics: 'Política', Security: 'Seguridad',
}
// Un color estable por tema para escanear la edición de un vistazo.
const hues: Record<string, number> = {
  IA: 0, Argentina: 1, Política: 1, Economía: 1, Apple: 2, Finanzas: 3, Mercados: 3, Inversiones: 3, Marketing: 4,
  Negocios: 5, Startups: 5, Herramientas: 6, Automatización: 6, Productividad: 6, Tecnología: 7, Plataformas: 7,
  Diseño: 4, Fotografía: 6, Mundo: 5, Regulación: 1, Seguridad: 7, Privacidad: 7, Cripto: 3, Ciencia: 0,
}
export const label = (category: string) => labels[category] || category
function hue(category: string) {
  const name = label(category)
  if (name in hues) return hues[name]
  let sum = 0
  for (const char of name) sum = (sum * 31 + char.charCodeAt(0)) >>> 0
  return sum % 8
}

export type Prefs = { tema: 'auto' | 'claro' | 'oscuro'; tamano: number; modo: 'lista' | 'una' }
export function parsePrefs(value: string | undefined): Prefs {
  const match = /^(auto|claro|oscuro)\.([0-3])\.(lista|una)$/.exec(value || '')
  return match ? { tema: match[1] as Prefs['tema'], tamano: Number(match[2]), modo: match[3] as Prefs['modo'] } : { tema: 'auto', tamano: 1, modo: 'lista' }
}

const icon = (name: keyof typeof paths, size = 20) => `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
const paths = {
  up: '<path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z"/><path d="M7 19c3 1.4 5.3 2 8.5 2h1.2a3 3 0 0 0 2.9-2.3l1.3-6A3 3 0 0 0 18 9h-4l.7-3.3A2.3 2.3 0 0 0 12.5 3L7 10"/>',
  down: '<path d="M7 14V3H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3Z"/><path d="M7 5c3-1.4 5.3-2 8.5-2h1.2a3 3 0 0 1 2.9 2.3l1.3 6A3 3 0 0 1 18 15h-4l.7 3.3a2.3 2.3 0 0 1-2.2 2.7L7 14"/>',
  share: '<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  cards: '<rect x="7" y="3.5" width="10" height="17" rx="2.2"/><path d="m3.6 9.5-2.1 2.5 2.1 2.5M20.4 9.5l2.1 2.5-2.1 2.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".8"/><circle cx="3.5" cy="12" r=".8"/><circle cx="3.5" cy="18" r=".8"/>',
  listen: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z"/><path d="M3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2Z"/>',
  play: '<path d="M7 4.5v15l12-7.5Z" fill="currentColor"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>',
  prev: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
}

const head = (title: string) => `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#fbfaf7" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#111216" media="(prefers-color-scheme: dark)"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Brief"><meta name="apple-mobile-web-app-status-bar-style" content="default"><link rel="manifest" href="/brief.webmanifest"><link rel="icon" href="/brief-icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/brief-icon-180.png"><title>${esc(title)}</title><link rel="stylesheet" href="/brief.css">`

export function documentResponse(body: string, title: string, js = script, status = 200, prefs: Prefs = parsePrefs(undefined)) {
  const hash = createHash('sha256').update(js).digest('base64')
  return new Response(`<!doctype html><html lang="es-AR" data-theme="${prefs.tema}" data-size="${prefs.tamano}" data-mode="${prefs.modo}"><head>${head(title)}</head><body>${body}${js ? `<script>${js}</script>` : ''}</body></html>`, { status, headers: {
    'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': `default-src 'none'; style-src 'self'; script-src 'sha256-${hash}'; img-src 'self' https:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  } })
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length
function storyWords(item: Noticia) {
  return words([item.titulo, item.bajada || '', item.resumen, ...(item.claves || []), item.por_que_importa || ''].join(' '))
}
const minutes = (count: number) => Math.max(1, Math.round(count / 230))

function longDate(fecha: string) {
  const date = new Date(fecha + 'T12:00:00Z')
  const text = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}
function hourOf(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
}

// Primer enunciado destacado: la redacción abre con el cambio central.
function paragraphs(text: string) {
  const blocks = text.split(/\n\s*\n|\n/).map(block => block.trim()).filter(Boolean)
  return blocks.map((block, index) => {
    if (index > 0) return `<p>${esc(block)}</p>`
    const match = /^(.{40,260}?[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡"«“0-9])/.exec(block)
    return match ? `<p><span class="lede">${esc(match[1])}</span> ${esc(block.slice(match[0].length))}</p>` : `<p>${esc(block)}</p>`
  }).join('')
}

function sources(item: Noticia) {
  if (!item.fuentes_resumen?.length) return `<span class="src">${esc(item.fuente)}</span>`
  return `<span class="src">${item.fuentes_resumen.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.nombre)}</a>`).join(' · ')}</span>`
}

function article(item: Noticia, index: number, total: number) {
  const name = label(item.categoria)
  const number = String(index + 1).padStart(2, '0')
  const read = minutes(storyWords(item))
  return `<article id="n-${esc(item.id)}" class="story${index === 0 ? ' lead' : ''}" data-id="${esc(item.id)}" data-index="${index}" data-category="${esc(item.categoria)}" aria-label="Noticia ${index + 1} de ${total}">
<div class="meta"><span class="num">${number}</span><span class="chip hue-${hue(item.categoria)}">${esc(name)}</span>${sources(item)}${item.publicado_en ? `<time class="ago" datetime="${esc(item.publicado_en)}"></time>` : ''}<span class="mins">${read} min</span></div>
<h2>${esc(item.titulo)}</h2>
${item.bajada ? `<p class="dek">${esc(item.bajada)}</p>` : ''}
${item.imagen ? `<figure class="article-image"><img src="${esc(item.imagen.url)}" alt="${esc(item.imagen.alt || item.titulo)}" width="1200" height="675" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer"></figure>` : ''}
<div class="body">${paragraphs(item.resumen)}</div>
${item.claves?.length ? `<ul class="claves" aria-label="Claves">${item.claves.map(key => `<li>${esc(key)}</li>`).join('')}</ul>` : ''}
${item.por_que_importa ? `<aside class="why"><b>Por qué importa</b><p>${esc(item.por_que_importa)}</p></aside>` : ''}
<div class="article-actions"><a class="original" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Original: ${esc(item.titulo)}">Original</a><button class="icon-button share" type="button" data-share="${esc(item.url)}" aria-label="Compartir: ${esc(item.titulo)}">${icon('share', 19)}</button><div class="feedback-votes" role="group" aria-label="Valorar noticia"><button class="feedback-vote" type="button" data-feedback="${esc(item.id)}" data-value="util" aria-label="Me sirvió: ${esc(item.titulo)}" aria-pressed="false">${icon('up', 19)}</button><button class="feedback-vote" type="button" data-feedback="${esc(item.id)}" data-value="no_util" aria-label="No me sirvió: ${esc(item.titulo)}" aria-pressed="false">${icon('down', 19)}</button></div><span role="status"></span></div>
</article>`
}

export type BriefContext = { prefs: Prefs; latest: boolean; previous?: string; next?: string }

export function renderBrief(brief: Brief, context: BriefContext = { prefs: parsePrefs(undefined), latest: true }) {
  const total = brief.noticias.length
  const totalMinutes = minutes(brief.noticias.reduce((sum, item) => sum + storyWords(item), 0))
  const counts = new Map<string, number>()
  for (const item of brief.noticias) counts.set(item.categoria, (counts.get(item.categoria) || 0) + 1)
  const filters = counts.size > 1 ? `<div class="filters" role="group" aria-label="Filtrar por tema"><button type="button" data-filter="all" aria-pressed="true">Todas <span>${total}</span></button>${Array.from(counts).map(([category, count]) => `<button type="button" data-filter="${esc(category)}" aria-pressed="false"><i class="dot hue-${hue(category)}"></i>${esc(label(category))} <span>${count}</span></button>`).join('')}</div>` : ''
  const index = brief.noticias.map((item, i) => `<li data-category="${esc(item.categoria)}"><a href="#n-${esc(item.id)}" data-jump="${esc(item.id)}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="index-text"><span class="index-title">${esc(item.titulo)}</span><span class="index-meta"><i class="dot hue-${hue(item.categoria)}"></i>${esc(label(item.categoria))} · ${esc(item.fuente)}</span></span><span class="seen-mark" aria-hidden="true">${icon('check', 16)}</span></a></li>`).join('')
  const turno = brief.turno === 'manana' ? 'Edición de la mañana' : 'Edición de la tarde'
  const summary = brief.resumen ? `<p class="resumen">${esc(brief.resumen)}</p>` : ''
  const highlights = brief.lo_importante?.length ? `<div class="lo-importante"><h2>Lo importante</h2><ul>${brief.lo_importante.map(point => `<li>${esc(point)}</li>`).join('')}</ul></div>` : ''
  const editionNav = `${context.previous ? `<a class="pill" href="/brief?e=${esc(context.previous)}">${icon('prev', 16)} Anterior</a>` : ''}<a class="pill" href="/brief/archivo">${icon('archive', 16)} Archivo</a>${context.next ? `<a class="pill" href="${context.next === 'latest' ? '/brief' : `/brief?e=${esc(context.next)}`}">Siguiente ${icon('next', 16)}</a>` : ''}`
  const body = `<div class="app" data-edition="${esc(brief.edicion_id)}" data-latest="${context.latest ? '1' : '0'}" data-total="${total}">
<header class="top"><a class="brand" href="/brief" aria-label="Brief, última edición">Brief</a><span class="top-date">${esc(longDate(brief.fecha).split(',')[0])} · ${brief.turno === 'manana' ? 'Mañana' : 'Tarde'}</span><div class="top-actions"><button class="icon-button" id="modo" type="button" aria-pressed="${context.prefs.modo === 'una'}" aria-label="Leer una por vez" title="Una por vez (U)">${icon('cards')}${icon('list')}</button><button class="icon-button" id="escuchar" type="button" aria-label="Escuchar la edición" title="Escuchar (L)">${icon('listen')}</button><button class="icon-button" id="ajustes" type="button" aria-haspopup="dialog" aria-label="Ajustes" title="Ajustes">${icon('settings')}</button></div><div class="progress" aria-hidden="true"><span></span></div></header>
${context.latest ? '' : `<p class="notice archived">Edición archivada · <a href="/brief">Ir a la última</a></p>`}
<p class="notice update" id="nueva" hidden>Hay una edición nueva · <a href="/brief">Abrir</a></p>
<div class="flow" id="flow">
<section class="cover" id="portada" aria-labelledby="titulo-edicion"><p class="kicker">${turno}</p><h1 id="titulo-edicion">${esc(longDate(brief.fecha))}</h1><p class="edition-meta">${total} ${total === 1 ? 'noticia' : 'noticias'} · ${totalMinutes} min de lectura · ${hourOf(brief.generado_en)} h</p>${summary}${highlights}<div class="cover-actions"><button class="primary" id="empezar" type="button">${icon('cards', 18)}<span>Empezar a leer</span></button><button class="secondary" id="escuchar-todo" type="button">${icon('listen', 18)}<span>Escuchar</span></button></div><p class="cover-progress" id="avance" aria-live="polite"></p>${filters}<nav class="index" aria-label="Titulares"><ol>${index}</ol></nav></section>
${brief.noticias.map((item, i) => article(item, i, total)).join('\n')}
${total ? '' : '<p class="empty">No hay noticias seleccionadas.</p>'}
<section class="end" id="fin" aria-label="Fin de la edición"><div class="end-inner"><span class="end-mark">${icon('check', 28)}</span><h2>Terminaste el brief</h2><p class="end-text" id="fin-texto">${total} noticias · ${totalMinutes} min</p><footer><div class="lectura"><button id="marcar-leida" class="primary" type="button" hidden>Ya leí esta edición</button><span id="lectura-estado" role="status"></span></div></footer><nav class="edition-nav" aria-label="Ediciones">${editionNav}</nav></div></section>
</div>
<div class="dock" id="dock"><button class="icon-button" id="dock-prev" type="button" aria-label="Anterior">${icon('prev', 22)}</button><button class="icon-button play" id="dock-play" type="button" aria-label="Escuchar">${icon('play', 22)}${icon('pause', 22)}</button><button class="icon-button" id="dock-next" type="button" aria-label="Siguiente">${icon('next', 22)}</button><div class="dock-label"><span id="dock-pos"></span><span id="dock-title"></span></div><button class="speed" id="dock-speed" type="button" aria-label="Velocidad de lectura">1×</button><button class="icon-button" id="dock-close" type="button" aria-label="Dejar de escuchar">${icon('close', 20)}</button></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
${dialog}
<dialog id="ajustes-dialog" aria-labelledby="ajustes-titulo"><form id="ajustes-form"><div class="dialog-heading"><h2 id="ajustes-titulo">Ajustes</h2><button class="icon-button" id="ajustes-close" type="button" aria-label="Cerrar">${icon('close')}</button></div>
<fieldset><legend>Tema</legend><div class="segmented"><label><input type="radio" name="tema" value="auto">Automático</label><label><input type="radio" name="tema" value="claro">Claro</label><label><input type="radio" name="tema" value="oscuro">Oscuro</label></div></fieldset>
<fieldset><legend>Tamaño del texto</legend><div class="segmented"><label><input type="radio" name="tamano" value="0">A</label><label><input type="radio" name="tamano" value="1">A</label><label><input type="radio" name="tamano" value="2">A</label><label><input type="radio" name="tamano" value="3">A</label></div></fieldset>
<fieldset><legend>Lectura en voz alta</legend><label class="field">Voz<select id="voz"><option value="">Automática</option></select></label><label class="field">Velocidad<select id="velocidad"><option value="0.9">0,9×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option><option value="1.3">1,3×</option><option value="1.5">1,5×</option></select></label></fieldset>
<div class="install" id="instalar" hidden><h3>Instalar como app</h3><p id="instalar-texto">En el iPhone: Compartir → Agregar a inicio.</p><button class="secondary" id="instalar-boton" type="button" hidden>Instalar</button></div>
<details class="shortcuts"><summary>Atajos de teclado</summary><dl><dt>← →  o  J K</dt><dd>Noticia anterior / siguiente</dd><dt>U</dt><dd>Una por vez / lista</dd><dt>L</dt><dd>Escuchar / pausar</dd><dt>O</dt><dd>Abrir el original</dd><dt>Esc</dt><dd>Volver a la lista</dd></dl></details>
<p class="dialog-links"><a href="/brief/archivo">${icon('archive', 16)} Archivo de ediciones</a></p></form></dialog>`
  return documentResponse(body, `Brief · ${longDate(brief.fecha)}`, script, 200, context.prefs)
}

export function renderArchive(ids: string[], reads: string[], latestId: string | null, prefs: Prefs) {
  const byDay = new Map<string, { id: string; hora: string }[]>()
  for (const id of ids) {
    const moment = editionMoment(id)
    const day = moment?.fecha || 'Sin fecha'
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day)!.push({ id, hora: moment?.hora || '' })
  }
  const readSet = new Set(reads)
  const unread = ids.filter(id => !readSet.has(id)).length
  const days = Array.from(byDay).map(([day, editions]) => `<li class="day"><h2>${day === 'Sin fecha' ? day : esc(longDate(day))}</h2><ul>${editions.slice().reverse().map(edition => {
    const hour = Number(edition.hora.slice(0, 2))
    const name = Number.isFinite(hour) && edition.hora ? (hour < 12 ? 'Mañana' : 'Tarde') : 'Edición'
    const isRead = readSet.has(edition.id)
    const href = edition.id === latestId ? '/brief' : `/brief?e=${esc(edition.id)}`
    return `<li><a class="edition${isRead ? ' read' : ''}" href="${href}"><span class="edition-name">${name}</span><span class="edition-hour">${esc(edition.hora)}</span>${edition.id === latestId ? '<span class="badge">Última</span>' : ''}<span class="edition-state">${isRead ? `${icon('check', 15)} Leída` : '<i class="dot unread"></i> Sin leer'}</span></a></li>`
  }).join('')}</ul></li>`).join('')
  const body = `<div class="app archive-page"><header class="top"><a class="brand" href="/brief">Brief</a><span class="top-date">Archivo</span><div class="top-actions"><a class="icon-button" href="/brief" aria-label="Última edición">${icon('close')}</a></div></header><main class="archive"><h1>Archivo</h1><p class="edition-meta">${ids.length} ediciones · ${unread} sin leer</p>${ids.length ? `<ol class="days">${days}</ol>` : '<p class="empty">Todavía no hay ediciones archivadas.</p>'}</main></div>`
  return documentResponse(body, 'Brief · Archivo', '', 200, prefs)
}

const loginScript = `document.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();const button=document.querySelector('button'),status=document.getElementById('estado');button.disabled=true;status.textContent='';try{const r=await fetch('/api/brief/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('input').value})});if(!r.ok)throw Error(r.status===401?'Contraseña incorrecta':'No se pudo iniciar sesión. Reintentá.');location.href='/brief';}catch(error){status.textContent=error.message;button.disabled=false;}});`

export function renderLogin() {
  return documentResponse('<main class="login-page"><form class="brief-login"><p class="brand login-brand">Brief</p><p class="login-sub">Tu diario personal, dos veces por día.</p><label for="password">PIN o contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button class="original primary" type="submit">Entrar</button><p id="estado" role="status"></p></form></main>', 'Brief · Acceso', loginScript)
}
