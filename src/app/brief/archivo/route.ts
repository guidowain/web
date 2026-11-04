import { listEditions, loadBrief, loadReads } from '@/lib/brief/storage'
import { documentResponse, parsePrefs, renderArchive } from '@/lib/brief/render'
import { NextRequest, NextResponse } from 'next/server'
import { reader } from '@/lib/brief/access'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!await reader(request)) return NextResponse.redirect(new URL('/brief/login', request.url))
  const prefs = parsePrefs(request.cookies.get('brief-prefs')?.value)
  try {
    const [ids, reads, latest] = await Promise.all([listEditions(), loadReads().catch(() => [] as string[]), loadBrief().catch(() => null)])
    if (latest && !ids.includes(latest.edicion_id)) ids.unshift(latest.edicion_id)
    return renderArchive(ids, reads, latest?.edicion_id || null, prefs)
  } catch {
    return documentResponse('<main class="message"><p>No se pudo cargar el archivo. Reintentá.</p></main>', 'Brief · Archivo', '', 503, prefs)
  }
}
