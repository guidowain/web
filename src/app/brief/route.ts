import { editionMoment, listEditions, loadBrief, loadEdition, validId } from '@/lib/brief/storage'
import { documentResponse, parsePrefs, renderBrief } from '@/lib/brief/render'
import { NextRequest, NextResponse } from 'next/server'
import { readerCookie, readerSession, serializeCookie } from '@/lib/brief/access'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await readerSession(request)
  if (!session) return NextResponse.redirect(new URL('/brief/login', request.url))
  const prefs = parsePrefs(request.cookies.get('brief-prefs')?.value)
  const requested = request.nextUrl.searchParams.get('e')
  let response: Response
  try {
    const [latest, editions] = await Promise.all([loadBrief(), listEditions().catch(() => [] as string[])])
    const brief = requested && validId(requested) && requested !== latest?.edicion_id ? await loadEdition(requested) : latest
    if (!brief) {
      response = documentResponse(`<main class="message"><p>${requested ? 'No existe esa edición.' : 'Todavía no hay edición.'}</p><p><a class="pill" href="/brief/archivo">Ver archivo</a></p></main>`, 'Brief', '', 404, prefs)
    } else {
      const isLatest = brief.edicion_id === latest?.edicion_id
      // El archivo puede no incluir aún la última edición: se ubica por fecha.
      const ordered = editions.includes(brief.edicion_id) ? editions
        : [...editions, brief.edicion_id].sort((a, b) => (editionMoment(b)?.orden || b).localeCompare(editionMoment(a)?.orden || a))
      const position = ordered.indexOf(brief.edicion_id)
      const previous = ordered[position + 1]
      const newer = position > 0 ? ordered[position - 1] : undefined
      response = renderBrief(brief, { prefs, latest: isLatest, previous,
        next: isLatest ? undefined : newer === latest?.edicion_id ? 'latest' : newer })
    }
  } catch {
    response = documentResponse('<main class="message"><p>No se pudo cargar la edición. Reintentá.</p></main>', 'Brief', '', 503, prefs)
  }
  if (session.renew) response.headers.append('Set-Cookie', serializeCookie(await readerCookie()))
  return response
}
