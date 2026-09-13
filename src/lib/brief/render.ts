import { createHash } from 'crypto'
import type { Brief } from './storage'
const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))
const labels: Record<string, string> = { AI: 'IA', Apple: 'Apple', Finance: 'Finanzas', Argentina: 'Argentina', Marketing: 'Marketing', Business: 'Negocios', 'Tools & Automation': 'Herramientas' }
const script = `
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('article').forEach(a=>a.hidden=button.dataset.filter!=='all'&&a.dataset.category!==button.dataset.filter);
}));
const button=document.getElementById('marcar-leida'),status=document.getElementById('lectura-estado'),id=document.querySelector('main').dataset.edition;
function showRead(){button.hidden=true;status.textContent='Leída';}
async function getRead(){const r=await fetch('/api/brief/lecturas');if(r.status===401){status.innerHTML='<a href="/brief/login">Entrar para guardar lectura</a>';return;}if(!r.ok)throw Error();const data=await r.json();if(data.ids.includes(id))showRead();}
button.addEventListener('click',async()=>{button.disabled=true;try{const r=await fetch('/api/brief/lecturas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:[id]})});if(r.status===401){location.href='/brief/login';return;}if(!r.ok)throw Error();showRead();}catch{status.textContent='Lectura no guardada. Reintentá.';}finally{button.disabled=false;}});
getRead().catch(()=>status.textContent='Registro de lectura no disponible.');
`;
const loginScript = `document.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();const button=document.querySelector('button'),status=document.getElementById('estado');button.disabled=true;status.textContent='';try{const r=await fetch('/api/brief/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('input').value})});if(!r.ok)throw Error(r.status===401?'Contraseña incorrecta':'No se pudo iniciar sesión. Reintentá.');location.href='/brief';}catch(error){status.textContent=error.message;button.disabled=false;}});`

export function documentResponse(body: string, title: string, js = script, status = 200) {
  const hash = createHash('sha256').update(js).digest('base64')
  return new Response(`<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><link rel="stylesheet" href="/brief.css"></head><body>${body}${js ? `<script>${js}</script>` : ''}</body></html>`, { status, headers: {
    'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': `default-src 'none'; style-src 'self'; script-src 'sha256-${hash}'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  } })
}

export function renderBrief(brief: Brief) {
  const timestamp = new Date(brief.generado_en)
  const day = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' }).format(timestamp)
  const hour = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false }).format(timestamp)
  const categories = Array.from(new Set(brief.noticias.map(n => n.categoria)))
  const filters = categories.map(category => `<button type="button" data-filter="${esc(category)}" aria-pressed="false">${esc(labels[category] || category)}</button>`).join('')
  const news = brief.noticias.map((item, index) => `<article class="${index === 0 ? 'lead' : ''}" data-category="${esc(item.categoria)}"><div class="meta">${String(index + 1).padStart(2, '0')} / ${esc(labels[item.categoria] || item.categoria)}<span>${esc(item.fuente)}</span></div><h2>${esc(item.titulo)}</h2><p>${esc(item.resumen)}</p><a class="original" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Original: ${esc(item.titulo)}">Original</a></article>`).join('')
  return documentResponse(`<main data-edition="${esc(brief.edicion_id)}"><header><div class="masthead"><time datetime="${esc(brief.fecha)}">${day} · ${brief.turno === 'manana' ? 'Mañana' : 'Tarde'}</time><span>${brief.noticias.length} noticias · ${hour}</span></div></header><nav aria-label="Filtrar noticias"><button type="button" data-filter="all" aria-pressed="true">Todas</button>${filters}</nav><div class="grid">${news}</div>${news ? '' : '<p class="empty">No hay noticias seleccionadas.</p>'}<footer>Selección y resúmenes generados con IA local. Basado en títulos y extractos RSS; revisá la fuente para el contexto completo.<div class="lectura"><button id="marcar-leida" type="button">Ya leí esta edición</button><span id="lectura-estado" role="status"></span></div></footer></main>`, `Brief · ${brief.fecha}`)
}

export function renderLogin() {
  return documentResponse('<main><form class="brief-login"><h1>Brief</h1><label for="password">PIN o contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required><button class="original" type="submit">Entrar</button><p id="estado" role="status"></p></form></main>', 'Brief · Acceso', loginScript)
}
