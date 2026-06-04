import type { CategoriaNoticias, FuenteNoticias, PreferenciasNoticias } from './types'

export const categoriasNoticias: CategoriaNoticias[] = [
  'AI',
  'Apple',
  'Finance',
  'Argentina',
  'Business',
  'Marketing',
  'Tools & Automation',
]

export const fuentesNoticias: FuenteNoticias[] = [
  { id: 'google-ai-blog', nombre: 'Google AI Blog', categoria: 'AI', url: 'https://blog.google/technology/ai/rss/', calidad: 92, activa: true },
  { id: 'techcrunch-ai', nombre: 'TechCrunch AI', categoria: 'AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', calidad: 78, activa: true },
  { id: 'the-verge-ai', nombre: 'The Verge AI', categoria: 'AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', calidad: 82, activa: true },
  { id: 'mit-ai', nombre: 'MIT Technology Review AI', categoria: 'AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', calidad: 90, activa: true },
  { id: 'macrumors', nombre: 'MacRumors', categoria: 'Apple', url: 'https://www.macrumors.com/macrumors.xml', calidad: 78, activa: true },
  { id: '9to5mac', nombre: '9to5Mac', categoria: 'Apple', url: 'https://9to5mac.com/feed/', calidad: 78, activa: true },
  { id: 'appleinsider', nombre: 'AppleInsider', categoria: 'Apple', url: 'https://appleinsider.com/rss/news/', calidad: 74, activa: true },
  { id: 'macstories', nombre: 'MacStories', categoria: 'Apple', url: 'https://www.macstories.net/feed/', calidad: 80, activa: true },
  { id: 'sherwood', nombre: 'Sherwood', categoria: 'Finance', url: 'https://sherwood.news/rss.xml', calidad: 84, activa: true },
  { id: 'yahoo-finance', nombre: 'Yahoo Finance', categoria: 'Finance', url: 'https://finance.yahoo.com/news/rssindex', calidad: 76, activa: true },
  { id: 'coindesk', nombre: 'CoinDesk', categoria: 'Finance', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', calidad: 74, activa: true },
  { id: 'cointelegraph', nombre: 'CoinTelegraph', categoria: 'Finance', url: 'https://cointelegraph.com/rss', calidad: 68, activa: true },
  { id: 'ambito', nombre: 'Ambito', categoria: 'Argentina', url: 'https://www.ambito.com/rss/economia.xml', calidad: 72, activa: true },
  { id: 'clarin-economia', nombre: 'Clarin Economia', categoria: 'Argentina', url: 'https://www.clarin.com/rss/economia/', calidad: 72, activa: true },
  { id: 'clarin-politica', nombre: 'Clarin Politica', categoria: 'Argentina', url: 'https://www.clarin.com/rss/politica/', calidad: 72, activa: true },
  { id: 'infobae-economia', nombre: 'Infobae Economia', categoria: 'Argentina', url: 'https://www.infobae.com/arc/outboundfeeds/rss/category/economia/?outputType=xml', calidad: 72, activa: true },
  { id: 'infobae-politica', nombre: 'Infobae Politica', categoria: 'Argentina', url: 'https://www.infobae.com/arc/outboundfeeds/rss/category/politica/?outputType=xml', calidad: 72, activa: true },
  { id: 'lanacion-economia', nombre: 'La Nacion Economia', categoria: 'Argentina', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/economia/?outputType=xml', calidad: 76, activa: true },
  { id: 'lanacion-politica', nombre: 'La Nacion Politica', categoria: 'Argentina', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/politica/?outputType=xml', calidad: 76, activa: true },
  { id: 'marketing-dive', nombre: 'Marketing Dive', categoria: 'Marketing', url: 'https://www.marketingdive.com/feeds/news/', calidad: 74, activa: true },
  { id: 'adweek', nombre: 'Adweek', categoria: 'Marketing', url: 'https://www.adweek.com/feed/', calidad: 72, activa: true },
]

export const interesesGuido = [
  'ai',
  'ia',
  'apple',
  'iphone',
  'mac',
  'wwdc',
  'investing',
  'etf',
  'schd',
  'argentina',
  'marketing',
  'seo',
  'advertising',
  'design',
  'automation',
  'productivity',
  'framer',
  'vercel',
  'claude',
  'codex',
  'photoshop',
  'retouching',
  'startup',
]

export function crearPreferenciasIniciales(): PreferenciasNoticias {
  return {
    categoriasFavoritas: ['AI', 'Apple', 'Finance', 'Argentina', 'Marketing', 'Tools & Automation'],
    keywordsFavoritas: interesesGuido,
    fuentesFavoritas: ['Sherwood', 'MacRumors', '9to5Mac', 'La Nacion Economia', 'Infobae Economia'],
    fuentesSilenciadas: [],
    aprendizajeActivo: true,
    actualizadoEn: new Date().toISOString(),
  }
}
