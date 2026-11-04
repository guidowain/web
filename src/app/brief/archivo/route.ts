import { addToIndex, indexEntry, listEditions, loadArchived, loadBrief, loadIndex, loadReads, type IndiceItem } from '@/lib/brief/storage'
import { documentResponse, parsePrefs, renderArchive } from '@/lib/brief/render'
import { NextRequest, NextResponse } from 'next/server'
import { reader } from '@/lib/brief/access'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!await reader(request)) return NextResponse.redirect(new URL('/brief/login', request.url))
  const prefs = parsePrefs(request.cookies.get('brief-prefs')?.value)
  try {
    const [ids, reads, latest, index] = await Promise.all([listEditions(), loadReads().catch(() => [] as string[]),
      loadBrief().catch(() => null), loadIndex().catch(() => [] as IndiceItem[])])
    if (latest && !ids.includes(latest.edicion_id)) ids.unshift(latest.edicion_id)
    const known = new Map(index.map(item => [item.id, item]))
    if (latest) known.set(latest.edicion_id, indexEntry(latest))
    // Completa el índice de a poco con las ediciones anteriores a esta función.
    const missing = ids.filter(id => !known.has(id)).slice(0, 12)
    if (missing.length || (latest && !index.some(item => item.id === latest.edicion_id))) {
      const loaded = (await Promise.all(missing.map(id => loadArchived(id).catch(() => null)))).filter(Boolean).map(brief => indexEntry(brief!))
      loaded.forEach(item => known.set(item.id, item))
      await addToIndex([...loaded, ...(latest ? [indexEntry(latest)] : [])]).catch(() => {})
    }
    return renderArchive(ids, reads, latest?.edicion_id || null, prefs, known)
  } catch {
    return documentResponse('<main class="message"><p>No se pudo cargar el archivo. Reintentá.</p></main>', 'Brief · Archivo', '', 503, prefs)
  }
}
