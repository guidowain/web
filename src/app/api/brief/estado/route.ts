import { NextRequest, NextResponse } from 'next/server'
import { publisher, reader } from '@/lib/brief/access'
import { loadBrief, loadReads } from '@/lib/brief/storage'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Consulta liviana del lector: última edición publicada y ediciones leídas.
export async function GET(request: NextRequest) {
  if (!await publisher(request) && !await reader(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [latest, ids] = await Promise.all([loadBrief(), loadReads()])
    return NextResponse.json({ ultima: latest ? { id: latest.edicion_id, generado_en: latest.generado_en } : null, leidas: ids },
      { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: 'Estado no disponible' }, { status: 503 }) }
}
