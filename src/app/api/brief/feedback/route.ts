import { NextRequest, NextResponse } from 'next/server'
import { publisher, reader, sameOrigin, smallJson } from '@/lib/brief/access'
import { loadEdition, loadFeedback, saveFeedback, validId } from '@/lib/brief/storage'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  if (!await publisher(request) && !await reader(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { return NextResponse.json({ feedback: await loadFeedback() }, { headers: { 'Cache-Control': 'no-store' } }) }
  catch { return NextResponse.json({ error: 'Feedback no disponible' }, { status: 503 }) }
}
export async function POST(request: NextRequest) {
  if (!await publisher(request) && (!sameOrigin(request) || !await reader(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const value = await smallJson(request, 8000) as Record<string, unknown>
    if (!validId(value.id) || !validId(value.edicion_id) || !validId(value.noticia_id) || !['util','no_util'].includes(String(value.valor)) || typeof value.comentario !== 'string' || value.comentario.length > 1200) return NextResponse.json({ error: 'Feedback inválido' }, { status: 400 })
    const edition = await loadEdition(value.edicion_id)
    const item = edition?.noticias.find(n => n.id === value.noticia_id)
    if (!item) return NextResponse.json({ error: 'Noticia desconocida' }, { status: 400 })
    await saveFeedback({ id: value.id, edicion_id: value.edicion_id, noticia_id: value.noticia_id,
      valor: value.valor as 'util' | 'no_util', comentario: value.comentario.trim(), creado_en: new Date().toISOString(),
      titulo: item.titulo, categoria: item.categoria, fuente: item.fuente, url: item.url })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'No se pudo guardar. Reintentá.' }, { status: 503 }) }
}
