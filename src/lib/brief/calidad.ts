import type { Brief, Noticia } from './storage'

// Reglas de brief/REDACCION.md convertidas en avisos automáticos.
export type Aviso = { nivel: 'error' | 'aviso' | 'sugerencia'; regla: string; detalle: string; noticia?: string }

const words = (text: string) => text.split(/\s+/).filter(Boolean).length
const stems = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ñ\s]/g, ' ').split(/\s+/).filter(word => word.length > 3)
function overlap(base: string, candidate: string) {
  const known = new Set(stems(base)), list = stems(candidate)
  return list.length ? list.filter(word => known.has(word)).length / list.length : 0
}
const firstSentence = (text: string) => /^.+?[.!?](\s|$)/.exec(text.trim())?.[0] || text

const emptyTitle = /\b(incre[ií]ble|impactante|sorprendente|hist[oó]ric[oa]|lo que (ten[eé]s|tienes|hay) que saber|todo (lo que|sobre)|as[ií] (es|fue|ser[aá])|en vivo|minuto a minuto|no vas a creer)\b/i
const filler = /\b(cabe (destacar|se[ñn]alar)|es importante (mencionar|destacar|se[ñn]alar)|en este art[ií]culo|en resumen|en conclusi[oó]n|sin dudas?|vale la pena (mencionar|destacar)|no es para menos)\b/i
const genericWhy = /\b(es importante porque|esto es relevante|podr[ií]a tener (un )?impacto|es una noticia importante)\b/i

export function revisarNoticia(item: Noticia): Aviso[] {
  const out: Aviso[] = []
  const add = (nivel: Aviso['nivel'], regla: string, detalle: string) => out.push({ nivel, regla, detalle, noticia: item.id })
  const title = item.titulo.trim()
  if (title.length > 100) add('error', 'titulo-largo', `${title.length} caracteres; máximo 100, ideal 55 a 90.`)
  else if (title.length > 90) add('aviso', 'titulo-largo', `${title.length} caracteres; ideal 55 a 90.`)
  if (title.length < 40) add('aviso', 'titulo-corto', `${title.length} caracteres: probablemente le falta el dato.`)
  if (/[¿?]/.test(title)) add('error', 'titulo-pregunta', 'El título debe afirmar qué pasó, no preguntar.')
  if (/^[^:]{2,28}:\s/.test(title)) add('aviso', 'titulo-rotulo', `Empieza con un rótulo («${title.split(':')[0]}:»).`)
  if (emptyTitle.test(title)) add('aviso', 'titulo-vacio', `Usa una fórmula vacía: «${emptyTitle.exec(title)![0]}».`)
  if (/\.$/.test(title)) add('sugerencia', 'titulo-punto', 'Sin punto final.')
  const count = words(item.resumen)
  if (count < 90 || count > 150) add(count < 60 || count > 180 ? 'error' : 'aviso', 'resumen-extension', `${count} palabras; objetivo 100 a 140.`)
  if (overlap(title, firstSentence(item.resumen)) > 0.75) add('aviso', 'resumen-repite-titulo', 'La primera oración repite el título.')
  if (filler.test(item.resumen)) add('aviso', 'resumen-relleno', `Frase de relleno: «${filler.exec(item.resumen)![0]}».`)
  if (item.bajada) {
    if (item.bajada.length > 220) add('aviso', 'bajada-larga', `${item.bajada.length} caracteres; máximo 220.`)
    if (overlap(title, item.bajada) > 0.6) add('aviso', 'bajada-repite-titulo', 'La bajada repite el título.')
  }
  if (item.claves) {
    if (item.claves.length > 4) add('aviso', 'claves-muchas', `${item.claves.length} claves; máximo 4.`)
    item.claves.filter(key => key.length > 140).forEach(key => add('sugerencia', 'clave-larga', `«${key.slice(0, 40)}…» supera 140 caracteres.`))
  }
  if (item.por_que_importa) {
    if (item.por_que_importa.length > 320) add('aviso', 'por-que-largo', `${item.por_que_importa.length} caracteres; máximo 300.`)
    if (genericWhy.test(item.por_que_importa)) add('aviso', 'por-que-generico', 'Es genérico: mejor omitirlo que forzarlo.')
  }
  return out
}

export function revisarEdicion(brief: Brief): Aviso[] {
  const out = brief.noticias.flatMap(revisarNoticia)
  const add = (nivel: Aviso['nivel'], regla: string, detalle: string) => out.push({ nivel, regla, detalle })
  if (brief.noticias.length < 8) add('sugerencia', 'edicion-corta', `${brief.noticias.length} noticias; objetivo 12 a 14 si hay material sólido.`)
  const tally = (key: (item: Noticia) => string) => {
    const counts = new Map<string, number>()
    for (const item of brief.noticias) counts.set(key(item), (counts.get(key(item)) || 0) + 1)
    return counts
  }
  for (const [category, n] of Array.from(tally(item => item.categoria))) if (n > 4) add('aviso', 'categoria-dominante', `${n} noticias de ${category}; cupo máximo 4.`)
  for (const [source, n] of Array.from(tally(item => item.fuente))) if (n > 2) add('aviso', 'fuente-dominante', `${n} noticias de ${source}; máximo 2.`)
  for (const [url, n] of Array.from(tally(item => item.url))) if (n > 1) add('error', 'url-repetida', `${url} aparece ${n} veces.`)
  brief.noticias.forEach((a, i) => brief.noticias.slice(i + 1).forEach(b => {
    if (overlap(a.titulo, b.titulo) > 0.6 && overlap(b.titulo, a.titulo) > 0.6) add('aviso', 'posible-duplicado', `«${a.id}» y «${b.id}» parecen el mismo hecho.`)
  }))
  if (!brief.lo_importante?.length && brief.noticias.length >= 6) add('sugerencia', 'falta-lo-importante', 'Sumar 3 a 5 frases de «Lo importante».')
  return out
}
