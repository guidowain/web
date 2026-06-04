import { NextRequest, NextResponse } from 'next/server'
import { generarNewsBrief } from '@/lib/news/generator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(await generarNewsBrief({ actualizacion: 'manual' }))
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo generar el brief.'
    return NextResponse.json({ mensaje }, { status: 500 })
  }
}
