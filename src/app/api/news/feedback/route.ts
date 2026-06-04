import { NextRequest, NextResponse } from 'next/server'
import { leerEstadoNoticias, guardarEstadoNoticias } from '@/lib/news/storage'
import type { FeedbackValor, NoticiaNormalizada } from '@/lib/news/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { noticia?: NoticiaNormalizada; feedback?: FeedbackValor }
  if (!body.noticia || !body.feedback) {
    return NextResponse.json({ mensaje: 'Payload inválido.' }, { status: 400 })
  }

  const estado = await leerEstadoNoticias()
  estado.feedback.unshift({
    id: `${body.noticia.id}-${Date.now()}`,
    noticiaId: body.noticia.id,
    categoria: body.noticia.categoria,
    fuente: body.noticia.fuente,
    keywords: body.noticia.tags,
    feedback: body.feedback,
    timestamp: new Date().toISOString(),
  })
  estado.feedback = estado.feedback.slice(0, 1000)
  await guardarEstadoNoticias(estado)
  return NextResponse.json({ mensaje: 'Feedback guardado.', feedback: estado.feedback })
}
