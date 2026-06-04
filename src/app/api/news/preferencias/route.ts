import { NextRequest, NextResponse } from 'next/server'
import { categoriasNoticias, crearPreferenciasIniciales } from '@/lib/news/config'
import { guardarEstadoNoticias, guardarPreferenciasNoticias, leerEstadoNoticias, leerPreferenciasNoticias } from '@/lib/news/storage'
import type { CategoriaNoticias, PreferenciasNoticias } from '@/lib/news/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function validCategories(value: unknown): CategoriaNoticias[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is CategoriaNoticias => categoriasNoticias.includes(item))
}

export async function GET(request: NextRequest) {
  return NextResponse.json(await leerPreferenciasNoticias())
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as Partial<PreferenciasNoticias> & { reset?: boolean }
  if (body.reset) {
    const estado = await leerEstadoNoticias()
    estado.feedback = []
    estado.preferencias = crearPreferenciasIniciales()
    await guardarEstadoNoticias(estado)
    return NextResponse.json(estado.preferencias)
  }

  const current = await leerPreferenciasNoticias()
  const next: PreferenciasNoticias = {
    categoriasFavoritas: validCategories(body.categoriasFavoritas).length ? validCategories(body.categoriasFavoritas) : current.categoriasFavoritas,
    keywordsFavoritas: Array.isArray(body.keywordsFavoritas) ? body.keywordsFavoritas.map(String).filter(Boolean) : current.keywordsFavoritas,
    fuentesFavoritas: Array.isArray(body.fuentesFavoritas) ? body.fuentesFavoritas.map(String).filter(Boolean) : current.fuentesFavoritas,
    fuentesSilenciadas: Array.isArray(body.fuentesSilenciadas) ? body.fuentesSilenciadas.map(String).filter(Boolean) : current.fuentesSilenciadas,
    aprendizajeActivo: typeof body.aprendizajeActivo === 'boolean' ? body.aprendizajeActivo : current.aprendizajeActivo,
    actualizadoEn: new Date().toISOString(),
  }

  return NextResponse.json(await guardarPreferenciasNoticias(next))
}
