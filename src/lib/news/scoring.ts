import { interesesGuido } from './config'
import type { EstadoPersistenteNoticias, NoticiaNormalizada, PreferenciasNoticias } from './types'

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function freshnessScore(iso: string) {
  const ageHours = Math.max(0, (Date.now() - new Date(iso).getTime()) / 36e5)
  if (ageHours <= 8) return 18
  if (ageHours <= 24) return 12
  if (ageHours <= 72) return 6
  return -8
}

export function deduplicarNoticias(items: NoticiaNormalizada[]) {
  const seen = new Map<string, NoticiaNormalizada>()

  for (const item of items) {
    const titleKey = normalize(item.tituloOriginal).replace(/\b(the|a|an|el|la|los|las|de|del|en|and|or|y)\b/g, '').slice(0, 90)
    const hostKey = (() => {
      try {
        return new URL(item.url).pathname.replace(/\/$/, '')
      } catch {
        return item.url
      }
    })()
    const key = `${titleKey}-${hostKey}`
    const existing = seen.get(key)

    if (!existing) {
      seen.set(key, item)
      continue
    }

    existing.tambienVistoEn = Array.from(new Set([...existing.tambienVistoEn, item.fuente]))
    if (item.globalScore > existing.globalScore) {
      seen.set(key, { ...item, tambienVistoEn: Array.from(new Set([...item.tambienVistoEn, existing.fuente])) })
    }
  }

  return Array.from(seen.values())
}

export function puntuarNoticias(items: NoticiaNormalizada[], preferencias: PreferenciasNoticias, estado: EstadoPersistenteNoticias) {
  const feedbackBySource = new Map<string, number>()
  const feedbackByKeyword = new Map<string, number>()

  for (const item of estado.feedback) {
    const delta = item.feedback === 'interesante' || item.feedback === 'mas_como_esto' ? 4 : -5
    feedbackBySource.set(item.fuente, (feedbackBySource.get(item.fuente) || 0) + delta)
    for (const keyword of item.keywords) {
      feedbackByKeyword.set(keyword, (feedbackByKeyword.get(keyword) || 0) + delta)
    }
  }

  return items.map((item) => {
    const haystack = normalize(`${item.tituloOriginal} ${item.resumen} ${item.tags.join(' ')}`)
    const keywordMatches = [...interesesGuido, ...preferencias.keywordsFavoritas].filter((keyword) => haystack.includes(normalize(keyword))).length
    const categoryBoost = preferencias.categoriasFavoritas.includes(item.categoria) ? 10 : 0
    const sourceBoost = preferencias.fuentesFavoritas.includes(item.fuente) ? 3 : 0
    const mutedPenalty = preferencias.fuentesSilenciadas.includes(item.fuente) ? -30 : 0
    const learnedSource = preferencias.aprendizajeActivo ? feedbackBySource.get(item.fuente) || 0 : 0
    const learnedKeywords = preferencias.aprendizajeActivo
      ? item.tags.reduce((total, tag) => total + (feedbackByKeyword.get(tag) || 0), 0)
      : 0
    const impactBoost = keywordMatches * 4
    const rumorPenalty = /\brumou?r|leak|filtrado|podria|podría|reportedly\b/i.test(`${item.tituloOriginal} ${item.resumen}`) ? -8 : 0
    const clickbaitPenalty = /changed everything|you won't believe|shocking|just changed|no vas a creer/i.test(item.tituloOriginal) ? -10 : 0

    const globalScore = clamp(item.globalScore + freshnessScore(item.publicadoEn) + impactBoost / 2 + rumorPenalty + clickbaitPenalty)
    const personalScore = clamp(globalScore + categoryBoost + sourceBoost + mutedPenalty + learnedSource + learnedKeywords + impactBoost)

    return { ...item, globalScore, personalScore }
  }).sort((a, b) => b.personalScore - a.personalScore)
}
