import { NextRequest, NextResponse } from 'next/server'
import { publisher, reader, sameOrigin, smallJson } from '@/lib/brief/access'
import { loadEdition, loadReads, markReads, validId } from '@/lib/brief/storage'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!await publisher(request) && !await reader(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { return NextResponse.json({ ids: await loadReads() }, { headers: { 'Cache-Control': 'no-store' } }) }
  catch { return NextResponse.json({ error: 'Lectura no disponible' }, { status: 503 }) }
}

export async function POST(request: NextRequest) {
  const machine = await publisher(request)
  if (!machine && (!sameOrigin(request) || !await reader(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const value = await smallJson(request, 40_000) as { ids?: unknown }
    if (!Array.isArray(value.ids) || value.ids.length > 300 || !value.ids.every(validId)) return NextResponse.json({ error: 'Lectura inválida' }, { status: 400 })
    if (!machine) {
      if (value.ids.length !== 1 || !await loadEdition(value.ids[0])) return NextResponse.json({ error: 'Edición desconocida' }, { status: 400 })
    }
    await markReads(value.ids)
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'No se pudo guardar la lectura' }, { status: 503 }) }
}
