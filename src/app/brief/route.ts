import { loadBrief } from '@/lib/brief/storage'
import { documentResponse, renderBrief } from '@/lib/brief/render'
import { NextRequest, NextResponse } from 'next/server'
import { reader } from '@/lib/brief/access'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  if (!await reader(request)) return NextResponse.redirect(new URL('/brief/login', request.url))
  try {
    const brief = await loadBrief()
    return brief ? renderBrief(brief) : documentResponse('<main><p>Todavía no hay edición.</p></main>', 'Brief', '', 404)
  } catch { return documentResponse('<main><p>No se pudo cargar la edición. Reintentá.</p></main>', 'Brief', '', 503) }
}
