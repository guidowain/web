import { XMLParser } from 'fast-xml-parser'
import { fuentesNoticias } from './config'
import type { FuenteNoticias, NoticiaNormalizada } from './types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
})

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}

function text(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value && 'text' in value) return text((value as { text?: unknown }).text)
  return ''
}

function firstUrl(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return firstUrl(value[0])
  if (typeof value === 'object') {
    const candidate = value as { href?: string; url?: string; text?: string }
    return candidate.href || candidate.url || candidate.text || ''
  }
  return ''
}

function imageFromItem(item: Record<string, unknown>) {
  const mediaContent = item['media:content']
  const mediaThumbnail = item['media:thumbnail']
  const enclosure = item.enclosure
  return firstUrl(mediaContent) || firstUrl(mediaThumbnail) || firstUrl(enclosure) || undefined
}

function idFor(sourceId: string, url: string, title: string) {
  return `${sourceId}-${Buffer.from(url || title).toString('base64url').slice(0, 20)}`
}

function keywords(value: string) {
  return Array.from(
    new Set(
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9ñáéíóúü\s-]/gi, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .slice(0, 12),
    ),
  )
}

function parseRssItems(source: FuenteNoticias, xml: string): NoticiaNormalizada[] {
  const parsed = parser.parse(xml)
  const channelItems = toArray<Record<string, unknown>>(parsed?.rss?.channel?.item)
  const atomItems = toArray<Record<string, unknown>>(parsed?.feed?.entry)
  const items = channelItems.length ? channelItems : atomItems

  return items.map((item) => {
    const tituloOriginal = stripHtml(text(item.title))
    const url = firstUrl(item.link) || firstUrl(item.id) || source.url
    const resumen = stripHtml(text(item.description) || text(item.summary) || text(item.content) || text(item['content:encoded']))
    const publicadoEn = new Date(text(item.pubDate) || text(item.published) || text(item.updated) || Date.now()).toISOString()

    return {
      id: idFor(source.id, url, tituloOriginal),
      categoria: source.categoria,
      fuente: source.nombre,
      url,
      tituloOriginal,
      tituloLimpio: tituloOriginal,
      resumen: resumen.slice(0, 360),
      porQueImporta: '',
      publicadoEn,
      imagen: imageFromItem(item),
      globalScore: source.calidad,
      personalScore: source.calidad,
      tags: keywords(`${tituloOriginal} ${resumen}`),
      tambienVistoEn: [],
    }
  }).filter((item) => item.tituloOriginal && item.url)
}

export async function leerRssNoticias() {
  const results = await Promise.allSettled(
    fuentesNoticias.filter((source) => source.activa).map(async (source) => {
      const response = await fetch(source.url, {
        headers: { 'User-Agent': 'News Brief Guido Wain/1.0' },
        next: { revalidate: 0 },
      })
      if (!response.ok) throw new Error(`${source.nombre}: HTTP ${response.status}`)
      return parseRssItems(source, await response.text())
    }),
  )

  return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
}
