import { NextRequest, NextResponse } from 'next/server'
import { guardarNoticiaGuardada, leerGuardadas, quitarNoticiaGuardada } from '@/lib/news/storage'
import type { NoticiaNormalizada } from '@/lib/news/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json(await leerGuardadas())
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { noticia?: NoticiaNormalizada }
  if (!body.noticia) return NextResponse.json({ mensaje: 'Payload inválido.' }, { status: 400 })

  return NextResponse.json(await guardarNoticiaGuardada({
    noticiaId: body.noticia.id,
    noticia: body.noticia,
    guardadaEn: new Date().toISOString(),
  }))
}

export async function DELETE(request: NextRequest) {
  const noticiaId = request.nextUrl.searchParams.get('noticiaId')
  if (!noticiaId) return NextResponse.json({ mensaje: 'Falta noticiaId.' }, { status: 400 })
  return NextResponse.json(await quitarNoticiaGuardada(noticiaId))
}
