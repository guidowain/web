import { loadBrief } from '@/lib/brief/storage'
import { documentResponse, parsePrefs, renderBrief } from '@/lib/brief/render'
import { NextRequest, NextResponse } from 'next/server'
import { readerCookie, readerSession, serializeCookie } from '@/lib/brief/access'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await readerSession(request)
  if (!session) return NextResponse.redirect(new URL('/brief/login', request.url))
  const prefs = parsePrefs(request.cookies.get('brief-prefs')?.value)
  let response: Response
  try {
    const brief = await loadBrief()
    response = brief ? renderBrief(brief, { prefs, latest: true })
      : documentResponse('<main class="message"><p>Todavía no hay edición.</p></main>', 'Brief', '', 404, prefs)
  } catch {
    response = documentResponse('<main class="message"><p>No se pudo cargar la edición. Reintentá.</p></main>', 'Brief', '', 503, prefs)
  }
  if (session.renew) response.headers.append('Set-Cookie', serializeCookie(await readerCookie()))
  return response
}
