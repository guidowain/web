import { categoriasNoticias } from './config'
import { leerRssNoticias } from './rss'
import { deduplicarNoticias, puntuarNoticias } from './scoring'
import { pedirBriefAGemini } from './gemini'
import { guardarBrief, leerEstadoNoticias, leerUltimoBrief } from './storage'
import type { BriefDiario } from './types'

function fechaBuenosAires(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function actualizacionBuenosAires(date = new Date()): BriefDiario['actualizacion'] {
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', hour12: false }).format(date))
  if (hour < 12) return '09:00'
  if (hour < 17) return '14:00'
  return 'manual'
}

function mergeNoticias(
  base: Awaited<ReturnType<typeof puntuarNoticias>>,
  enriched: Awaited<ReturnType<typeof pedirBriefAGemini>>['noticias'],
) {
  const byId = new Map(enriched.map((item) => [item.id, item]))
  const allowedIds = enriched.length >= 8
    ? new Set(enriched.map((item) => item.id))
    : new Set(base.slice(0, 14).map((item) => item.id))

  return base.filter((item) => allowedIds.has(item.id)).map((item) => {
    const match = byId.get(item.id)
    // Gemini reescribe título y resumen (traduce al español y quita clickbait), pero el prompt
    // le prohíbe agregar nada que no esté en el material original. Si no devuelve algo, cae al RSS.
    return match
      ? {
          ...item,
          tituloLimpio: match.tituloLimpio || item.tituloLimpio,
          resumen: match.resumen || item.resumen,
          porQueImporta: match.porQueImporta || item.porQueImporta,
          tags: match.tags?.length ? match.tags : item.tags,
        }
      : item
  })
}

function seleccionarCandidatas(items: Awaited<ReturnType<typeof puntuarNoticias>>) {
  const selected: typeof items = []
  const bySource = new Map<string, number>()
  const byCategory = new Map<string, number>()

  function add(item: (typeof items)[number]) {
    if (selected.some((selectedItem) => selectedItem.id === item.id)) return
    const sourceCount = bySource.get(item.fuente) || 0
    const categoryCount = byCategory.get(item.categoria) || 0

    if (sourceCount >= 3) return
    if (categoryCount >= 10) return

    selected.push(item)
    bySource.set(item.fuente, sourceCount + 1)
    byCategory.set(item.categoria, categoryCount + 1)
  }

  for (const categoria of categoriasNoticias) {
    for (const item of items.filter((candidate) => candidate.categoria === categoria).slice(0, 5)) {
      add(item)
    }
  }

  for (const item of items) {
    add(item)

    if (selected.length >= 50) break
  }

  return selected
}

export async function generarNewsBrief(options: { fecha?: string; actualizacion?: BriefDiario['actualizacion'] } = {}) {
  const fecha = options.fecha || fechaBuenosAires()
  const actualizacion = options.actualizacion || actualizacionBuenosAires()
  const estado = await leerEstadoNoticias()

  try {
    const rss = await leerRssNoticias()
    const deduped = deduplicarNoticias(rss)
    const scored = puntuarNoticias(deduped, estado.preferencias, estado)
    const relevantes = seleccionarCandidatas(scored)

    if (relevantes.length === 0) {
      throw new Error('No hay noticias suficientes para generar un brief relevante.')
    }

    const enriched = await pedirBriefAGemini({ fecha, actualizacion, noticias: relevantes })
    const now = new Date().toISOString()
    const brief: BriefDiario = {
      fecha,
      generadoEn: now,
      actualizacion,
      resumenEjecutivo: enriched.resumenEjecutivo,
      radarPersonal: enriched.radarPersonal.slice(0, 5),
      loImportante: enriched.loImportante.slice(0, 7),
      oportunidades: enriched.oportunidades.slice(0, 5),
      riesgos: enriched.riesgos.slice(0, 5),
      conexiones: enriched.conexiones.slice(0, 6),
      noticias: mergeNoticias(relevantes, enriched.noticias),
      estado: { estado: 'ok', generadoEn: now },
    }

    await guardarBrief(brief)
    return brief
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fallo desconocido al generar el brief.'
    const previous = await leerUltimoBrief()
    if (previous) {
      return {
        ...previous,
        estado: {
          estado: 'error',
          mensaje: message,
          generadoEn: new Date().toISOString(),
        },
      } satisfies BriefDiario
    }
    throw error
  }
}

export { actualizacionBuenosAires, fechaBuenosAires }
