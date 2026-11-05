import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import path from 'path'
import { editionMoment, type Brief, type IndiceItem, type Noticia } from './storage'

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
export const label = (category: string) => labels[category] || category

export type Prefs = { tema: 'auto' | 'claro' | 'oscuro'; tamano: number; modo: 'lista' | 'una' }
export function parsePrefs(value: string | undefined): Prefs {
  const match = /^(auto|claro|oscuro)\.([0-3])\.(lista|una)$/.exec(value || '')
  return match ? { tema: match[1] as Prefs['tema'], tamano: Number(match[2]), modo: match[3] as Prefs['modo'] } : { tema: 'auto', tamano: 1, modo: 'lista' }
}

const icon = (name: keyof typeof paths, size = 20) => `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
const paths = {
  up: '<path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z"/><path d="M7 19c3 1.4 5.3 2 8.5 2h1.2a3 3 0 0 0 2.9-2.3l1.3-6A3 3 0 0 0 18 9h-4l.7-3.3A2.3 2.3 0 0 0 12.5 3L7 10"/>',
  down: '<path d="M7 14V3H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3Z"/><path d="M7 5c3-1.4 5.3-2 8.5-2h1.2a3 3 0 0 1 2.9 2.3l1.3 6A3 3 0 0 1 18 15h-4l.7 3.3a2.3 2.3 0 0 1-2.2 2.7L7 14"/>',
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

function paragraphs(text: string) {
  return text.split(/\n\s*\n|\n/).map(block => block.trim()).filter(Boolean).map(block => `<p>${esc(block)}</p>`).join('')
}

function sources(item: Noticia) {
  if (!item.fuentes_resumen?.length) return esc(item.fuente)
  return item.fuentes_resumen.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.nombre)}</a>`).join(', ')
}

function article(item: Noticia, index: number, total: number) {
  return `<article id="n-${esc(item.id)}" class="story" data-id="${esc(item.id)}" data-index="${index}" data-category="${esc(item.categoria)}" aria-label="Noticia ${index + 1} de ${total}">
<p class="meta"><span>${esc(label(item.categoria))}</span><span class="src">${sources(item)}</span>${item.publicado_en ? `<time class="ago" datetime="${esc(item.publicado_en)}"></time>` : ''}</p>
<h2>${esc(item.titulo)}</h2>
${item.bajada ? `<p class="dek">${esc(item.bajada)}</p>` : ''}
${item.imagen ? `<figure class="article-image"><img src="${esc(item.imagen.url)}" alt="${esc(item.imagen.alt || item.titulo)}" width="1200" height="675" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer"></figure>` : ''}
<div class="body">${paragraphs(item.resumen)}</div>
${item.claves?.length ? `<ul class="claves" aria-label="Claves">${item.claves.map(key => `<li>${esc(key)}</li>`).join('')}</ul>` : ''}
${item.por_que_importa ? `<p class="why"><b>Por qué importa.</b> ${esc(item.por_que_importa)}</p>` : ''}
<div class="article-actions"><a class="original" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Original: ${esc(item.titulo)}">Original</a><div class="feedback-votes" role="group" aria-label="Valorar noticia"><button class="feedback-vote" type="button" data-feedback="${esc(item.id)}" data-value="util" aria-label="Me sirvió: ${esc(item.titulo)}" aria-pressed="false">${icon('up', 19)}</button><button class="feedback-vote" type="button" data-feedback="${esc(item.id)}" data-value="no_util" aria-label="No me sirvió: ${esc(item.titulo)}" aria-pressed="false">${icon('down', 19)}</button></div><span role="status"></span></div>
</article>`
}

export type BriefContext = { prefs: Prefs; latest: boolean; previous?: string; next?: string }

function shortDate(fecha: string) {
  const text = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(fecha + 'T12:00:00Z')).replace(/[,.]/g, '')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function renderBrief(brief: Brief, context: BriefContext = { prefs: parsePrefs(undefined), latest: true }) {
  const total = brief.noticias.length
  const totalMinutes = minutes(brief.noticias.reduce((sum, item) => sum + storyWords(item), 0))
  const turno = brief.turno === 'manana' ? 'Mañana' : 'Tarde'
  const intro = `Brief. Edición de la ${brief.turno === 'manana' ? 'mañana' : 'tarde'}, ${longDate(brief.fecha).replace(',', '')}.`
  const summary = brief.resumen ? `<p class="resumen">${esc(brief.resumen)}</p>` : ''
  const highlights = brief.lo_importante?.length ? `<ul class="lo-importante">${brief.lo_importante.map(point => `<li>${esc(point)}</li>`).join('')}</ul>` : ''
  const nav = [
    context.previous ? `<a href="/brief?e=${esc(context.previous)}">← Edición anterior</a>` : '',
    '<a href="/brief/archivo">Archivo</a>',
    context.next ? `<a href="${context.next === 'latest' ? '/brief' : `/brief?e=${esc(context.next)}`}">Edición siguiente →</a>` : '',
  ].filter(Boolean).join('')
  const body = `<div class="app" data-edition="${esc(brief.edicion_id)}" data-latest="${context.latest ? '1' : '0'}" data-total="${total}" data-intro="${esc(intro)}">
<header class="top"><a class="brand" href="/brief" aria-label="Brief, última edición">Brief</a><span class="top-date">${esc(shortDate(brief.fecha))} · ${turno}</span><div class="top-actions"><button class="icon-button" id="modo" type="button" aria-pressed="${context.prefs.modo === 'una'}" aria-label="Leer una por vez" title="Una por vez">${icon('cards')}${icon('list')}</button><button class="icon-button" id="escuchar" type="button" aria-label="Escuchar" title="Escuchar">${icon('listen')}</button><button class="icon-button" id="ajustes" type="button" aria-haspopup="dialog" aria-label="Ajustes" title="Ajustes">${icon('settings')}</button></div><div class="progress" aria-hidden="true"><span></span></div></header>
${context.latest ? '' : `<p class="notice archived">Edición archivada · <a href="/brief">Ir a la última</a></p>`}
<p class="notice update" id="nueva" hidden>Hay una edición nueva · <a href="/brief">Abrir</a></p>
<main class="flow" id="flow">
<div class="edition-head"><p class="edition-line">${total} ${total === 1 ? 'noticia' : 'noticias'} · ${totalMinutes} min · ${hourOf(brief.generado_en)} h</p>${summary}${highlights}</div>
${brief.noticias.map((item, i) => article(item, i, total)).join('\n')}
${total ? '' : '<p class="empty">No hay noticias seleccionadas.</p>'}
<section class="end" id="fin" aria-label="Fin de la edición"><div class="lectura"><button id="marcar-leida" class="primary" type="button" hidden>Ya leí esta edición</button><span id="lectura-estado" role="status"></span></div><nav class="edition-nav" aria-label="Ediciones">${nav}</nav></section>
</main>
<div class="dock" id="dock"><button class="icon-button" id="dock-prev" type="button" aria-label="Anterior">${icon('prev', 22)}</button><button class="icon-button play" id="dock-play" type="button" aria-label="Escuchar">${icon('play', 22)}${icon('pause', 22)}</button><button class="icon-button" id="dock-next" type="button" aria-label="Siguiente">${icon('next', 22)}</button><div class="dock-label"><span id="dock-pos"></span><span id="dock-title"></span></div><button class="speed" id="dock-speed" type="button" aria-label="Velocidad de lectura">1×</button><button class="icon-button" id="dock-close" type="button" aria-label="Dejar de escuchar">${icon('close', 20)}</button></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
${dialog}
<dialog id="ajustes-dialog" aria-labelledby="ajustes-titulo"><form id="ajustes-form"><div class="dialog-heading"><h2 id="ajustes-titulo">Ajustes</h2><button class="icon-button" id="ajustes-close" type="button" aria-label="Cerrar">${icon('close')}</button></div>
<fieldset><legend>Tema</legend><div class="segmented"><label><input type="radio" name="tema" value="auto">Automático</label><label><input type="radio" name="tema" value="claro">Claro</label><label><input type="radio" name="tema" value="oscuro">Oscuro</label></div></fieldset>
<fieldset><legend>Tamaño del texto</legend><div class="segmented"><label><input type="radio" name="tamano" value="0">A</label><label><input type="radio" name="tamano" value="1">A</label><label><input type="radio" name="tamano" value="2">A</label><label><input type="radio" name="tamano" value="3">A</label></div></fieldset>
<fieldset><legend>Escuchar</legend><label class="field">Voz<select id="voz"><option value="">Automática</option></select></label><label class="field">Velocidad<select id="velocidad"><option value="0.9">0,9×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option><option value="1.3">1,3×</option><option value="1.5">1,5×</option></select></label><button class="secondary" id="probar-voz" type="button">Probar la voz</button></fieldset>
<div class="install" id="instalar" hidden><p id="instalar-texto">Para usarlo como app: Compartir → Agregar a inicio.</p><button class="secondary" id="instalar-boton" type="button" hidden>Instalar</button></div>
<p class="dialog-links"><a href="/brief/archivo">Archivo de ediciones</a></p></form></dialog>`
  return documentResponse(body, `Brief · ${longDate(brief.fecha)}`, script, 200, context.prefs)
}

export function renderArchive(ids: string[], reads: string[], latestId: string | null, prefs: Prefs, index = new Map<string, IndiceItem>()) {
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
    const info = index.get(edition.id)
    const shift = info ? (info.turno === 'manana' ? 'Mañana' : 'Tarde') : name
    const heads = info?.titulares.length ? `<ul class="edition-heads">${info.titulares.slice(0, 2).map(title => `<li>${esc(title)}</li>`).join('')}</ul>` : ''
    return `<li><a class="edition${isRead ? ' read' : ''}" href="${href}"><span class="edition-row"><span class="edition-name">${shift}</span><span class="edition-hour">${esc(edition.hora)}${info ? ` · ${info.total} noticias` : ''}</span>${edition.id === latestId ? '<span class="badge">Última</span>' : ''}<span class="edition-state">${isRead ? `${icon('check', 15)} Leída` : '<i class="dot unread"></i> Sin leer'}</span></span>${heads}</a></li>`
  }).join('')}</ul></li>`).join('')
  const body = `<div class="app archive-page"><header class="top"><a class="brand" href="/brief">Brief</a><span class="top-date">Archivo</span><div class="top-actions"><a class="icon-button" href="/brief" aria-label="Última edición">${icon('close')}</a></div></header><main class="archive"><h1>Archivo</h1><p class="edition-meta">${ids.length} ediciones · ${unread} sin leer</p>${ids.length ? `<ol class="days">${days}</ol>` : '<p class="empty">Todavía no hay ediciones archivadas.</p>'}</main></div>`
  return documentResponse(body, 'Brief · Archivo', '', 200, prefs)
}

const loginScript = `document.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();const button=document.querySelector('button'),status=document.getElementById('estado');button.disabled=true;status.textContent='';try{const r=await fetch('/api/brief/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('input').value})});if(!r.ok)throw Error(r.status===401?'Contraseña incorrecta':'No se pudo iniciar sesión. Reintentá.');location.href='/brief';}catch(error){status.textContent=error.message;button.disabled=false;}});`

export function renderLogin() {
  return documentResponse('<main class="login-page"><form class="brief-login"><p class="brand login-brand">Brief</p><p class="login-sub">Tu diario personal, dos veces por día.</p><label for="password">PIN o contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button class="original primary" type="submit">Entrar</button><p id="estado" role="status"></p></form></main>', 'Brief · Acceso', loginScript)
}
