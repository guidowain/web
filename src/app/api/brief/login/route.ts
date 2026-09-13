import { NextRequest, NextResponse } from 'next/server'
import { checkAdminCredentials, createScopedToken } from '@/lib/admin/auth'
import { sameOrigin, smallJson } from '@/lib/brief/access'
import { createHash, timingSafeEqual } from 'crypto'
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origen inválido' }, { status: 403 })
  try {
    const body = await smallJson(request, 1000) as { password?: unknown }
    if (typeof body.password !== 'string') return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    const pin = process.env.NEWS_PIN
    const pinMatches = Boolean(pin && timingSafeEqual(createHash('sha256').update(body.password).digest(), createHash('sha256').update(pin).digest()))
    if (!pinMatches && !checkAdminCredentials(body.password)) return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    const token = await createScopedToken('brief-reader', 30 * 86400_000)
    const response = NextResponse.json({ ok: true })
    response.cookies.set('brief-reader', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 30 * 86400 })
    return response
  } catch { return NextResponse.json({ error: 'No se pudo iniciar sesión' }, { status: 400 }) }
}
