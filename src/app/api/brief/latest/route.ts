import { NextRequest, NextResponse } from 'next/server'
import { publisher, reader, smallJson } from '@/lib/brief/access'
import { loadBrief, parseBrief, publishBrief } from '@/lib/brief/storage'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!await publisher(request) && !await reader(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const brief = await loadBrief()
    return NextResponse.json(brief || { error: 'Todavía no hay edición' }, { status: brief ? 200 : 404, headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: 'Edición no disponible' }, { status: 503 }) }
}

export async function POST(request: NextRequest) {
  if (!await publisher(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let brief
  try { brief = parseBrief(await smallJson(request)) }
  catch { return NextResponse.json({ error: 'Edición inválida' }, { status: 400 }) }
  try {
    await publishBrief(brief)
    return NextResponse.json({ ok: true, edicion_id: brief.edicion_id })
  } catch { return NextResponse.json({ error: 'No se pudo publicar la edición' }, { status: 503 }) }
}
