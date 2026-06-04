import { NextRequest, NextResponse } from 'next/server'
import { leerBrief, leerUltimoBrief } from '@/lib/news/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const fecha = request.nextUrl.searchParams.get('fecha')
  try {
    const brief = fecha ? await leerBrief(fecha) : await leerUltimoBrief()
    if (!brief) return NextResponse.json({ mensaje: 'No hay brief disponible.' }, { status: 404 })
    return NextResponse.json(brief)
  } catch {
    return NextResponse.json({ mensaje: 'No se encontró el brief.' }, { status: 404 })
  }
}
