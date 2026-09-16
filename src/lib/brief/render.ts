import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import path from 'path'
import type { Brief } from './storage'
const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))
const labels: Record<string, string> = { AI: 'IA', Apple: 'Apple', Finance: 'Finanzas', Argentina: 'Argentina', Marketing: 'Marketing', Business: 'Negocios', 'Tools & Automation': 'Herramientas' }
const script = readFileSync(path.join(process.cwd(), 'public', 'brief-client.js'), 'utf8')
const dialog = readFileSync(path.join(process.cwd(), 'public', 'brief-feedback.html'), 'utf8')
const loginScript = `document.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();const button=document.querySelector('button'),status=document.getElementById('estado');button.disabled=true;status.textContent='';try{const r=await fetch('/api/brief/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('input').value})});if(!r.ok)throw Error(r.status===401?'Contraseña incorrecta':'No se pudo iniciar sesión. Reintentá.');location.href='/brief';}catch(error){status.textContent=error.message;button.disabled=false;}});`

export function documentResponse(body: string, title: string, js = script, status = 200) {
  const hash = createHash('sha256').update(js).digest('base64')
  return new Response(`<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><link rel="stylesheet" href="/brief.css"></head><body>${body}${js ? `<script>${js}</script>` : ''}</body></html>`, { status, headers: {
    'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': `default-src 'none'; style-src 'self'; script-src 'sha256-${hash}'; img-src https:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  } })
}

export function renderBrief(brief: Brief) {
  const timestamp = new Date(brief.generado_en)
  const day = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' }).format(timestamp)
  const hour = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false }).format(timestamp)
  const categories = Array.from(new Set(brief.noticias.map(n => n.categoria)))
  const filters = categories.map(category => `<button type="button" data-filter="${esc(category)}" aria-pressed="false">${esc(labels[category] || category)}</button>`).join('')
  const thumbUp = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z"/><path d="M7 19c3 1.4 5.3 2 8.5 2h1.2a3 3 0 0 0 2.9-2.3l1.3-6A3 3 0 0 0 18 9h-4l.7-3.3A2.3 2.3 0 0 0 12.5 3L7 10"/></svg>'
  const thumbDown = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 14V3H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3Z"/><path d="M7 5c3-1.4 5.3-2 8.5-2h1.2a3 3 0 0 1 2.9 2.3l1.3 6A3 3 0 0 1 18 15h-4l.7 3.3a2.3 2.3 0 0 1-2.2 2.7L7 14"/></svg>'
  const news = brief.noticias.map((item, index) => `<article class="${index === 0 ? 'lead' : ''}" data-category="${esc(item.categoria)}"><div class="meta">${String(index + 1).padStart(2, '0')} / ${esc(labels[item.categoria] || item.categoria)}<span>${item.fuentes_resumen?.length ? item.fuentes_resumen.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.nombre)}</a>`).join(' · ') : esc(item.fuente)}</span></div><h2>${esc(item.titulo)}</h2>${item.imagen ? `<figure class="article-image"><img src="${esc(item.imagen.url)}" alt="${esc(item.imagen.alt || item.titulo)}" width="1200" height="675" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer"></figure>` : ''}<p>${esc(item.resumen)}</p><div class="article-actions"><a class="original" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Original: ${esc(item.titulo)}">Original</a><div class="feedback-votes" aria-label="Valorar noticia"><button class="feedback-vote" type="button" data-feedback="${esc(item.id)}" data-value="util" aria-label="Me sirvió: ${esc(item.titulo)}" aria-pressed="false">${thumbUp}</button><button class="feedback-vote" type="button" data-feedback="${esc(item.id)}" data-value="no_util" aria-label="No me sirvió: ${esc(item.titulo)}" aria-pressed="false">${thumbDown}</button></div><span role="status"></span></div></article>`).join('')
  return documentResponse(`<main data-edition="${esc(brief.edicion_id)}"><header><div class="masthead"><time datetime="${esc(brief.fecha)}">${day} · ${brief.turno === 'manana' ? 'Mañana' : 'Tarde'}</time><span>${brief.noticias.length} noticias · ${hour}</span></div></header><nav aria-label="Filtrar noticias"><button type="button" data-filter="all" aria-pressed="true">Todas</button>${filters}</nav><div class="grid">${news}</div>${news ? '' : '<p class="empty">No hay noticias seleccionadas.</p>'}<footer><div class="lectura"><button id="marcar-leida" type="button" hidden>Ya leí esta edición</button><span id="lectura-estado" role="status"></span></div></footer></main>${dialog}`, `Brief · ${brief.fecha}`)
}

export function renderLogin() {
  return documentResponse('<main><form class="brief-login"><h1>Brief</h1><label for="password">PIN o contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required><button class="original" type="submit">Entrar</button><p id="estado" role="status"></p></form></main>', 'Brief · Acceso', loginScript)
}
