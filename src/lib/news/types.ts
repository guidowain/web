export type CategoriaNoticias =
  | 'AI'
  | 'Apple'
  | 'Finance'
  | 'Argentina'
  | 'Business'
  | 'Marketing'
  | 'Tools & Automation'

export type FuenteNoticias = {
  id: string
  nombre: string
  categoria: CategoriaNoticias
  url: string
  calidad: number
  activa: boolean
}

export type NoticiaNormalizada = {
  id: string
  categoria: CategoriaNoticias
  fuente: string
  url: string
  tituloOriginal: string
  tituloLimpio: string
  resumen: string
  porQueImporta: string
  publicadoEn: string
  imagen?: string
  globalScore: number
  personalScore: number
  feedback?: FeedbackValor
  tags: string[]
  tambienVistoEn: string[]
}

export type Insight = {
  id: string
  titulo: string
  resumen: string
  categoria: CategoriaNoticias | 'General'
  fuentes: string[]
  urls: string[]
  score: number
  tags: string[]
}

export type Oportunidad = {
  id: string
  categoria: 'DRAMA' | 'Investing' | 'Automation' | 'AI' | 'Marketing' | 'Productivity'
  titulo: string
  detalle: string
  acciones: string[]
}

export type Riesgo = {
  id: string
  categoria: 'Market' | 'Regulatory' | 'Technology' | 'Platform' | 'SEO' | 'AI'
  titulo: string
  detalle: string
  mitigacion: string
}

export type Conexion = {
  id: string
  titulo: string
  historias: string[]
  conclusion: string
}

export type EstadoGeneracion = {
  estado: 'ok' | 'error'
  mensaje?: string
  generadoEn: string
}

export type BriefDiario = {
  fecha: string
  generadoEn: string
  actualizacion: '09:00' | '14:00' | 'manual'
  resumenEjecutivo: string
  radarPersonal: Insight[]
  loImportante: string[]
  oportunidades: Oportunidad[]
  riesgos: Riesgo[]
  conexiones: Conexion[]
  noticias: NoticiaNormalizada[]
  estado: EstadoGeneracion
}

export type FeedbackValor = 'interesante' | 'no_interesante' | 'mas_como_esto' | 'menos_como_esto'

export type FeedbackUsuario = {
  id: string
  noticiaId: string
  categoria: CategoriaNoticias
  fuente: string
  keywords: string[]
  feedback: FeedbackValor
  timestamp: string
}

export type NoticiaGuardada = {
  noticiaId: string
  noticia: NoticiaNormalizada
  guardadaEn: string
}

export type PreferenciasNoticias = {
  categoriasFavoritas: CategoriaNoticias[]
  keywordsFavoritas: string[]
  fuentesFavoritas: string[]
  fuentesSilenciadas: string[]
  aprendizajeActivo: boolean
  actualizadoEn: string
}

export type CredencialWebAuthnGuardada = {
  id: string
  publicKey: string
  algorithm: number
  creadaEn: string
}

export type EstadoPersistenteNoticias = {
  preferencias: PreferenciasNoticias
  feedback: FeedbackUsuario[]
  guardadas: NoticiaGuardada[]
  credencialesWebAuthn: CredencialWebAuthnGuardada[]
}
