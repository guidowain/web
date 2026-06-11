import { NextRequest, NextResponse } from 'next/server'
import { checkNewsPin, createNewsToken, newsCookieName, newsTokenMaxAgeSeconds } from '@/lib/admin/auth'
import { leerCredencialesWebAuthn } from '@/lib/news/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { pin } = (await request.json()) as { pin?: string }

  if (!pin || !checkNewsPin(pin)) {
    return NextResponse.json({ mensaje: 'PIN incorrecto.' }, { status: 401 })
  }

  const credenciales = await leerCredencialesWebAuthn()
  const response = NextResponse.json({ ok: true, tieneWebAuthn: credenciales.length > 0 })
  response.cookies.set(newsCookieName, await createNewsToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: newsTokenMaxAgeSeconds,
    path: '/',
  })

  return response
}
