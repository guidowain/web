import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  createNewsToken,
  createScopedToken,
  newsCookieName,
  newsTokenMaxAgeSeconds,
  readScopedToken,
} from '@/lib/admin/auth'
import { guardarCredencialWebAuthn, leerCredencialesWebAuthn } from '@/lib/news/storage'
import { verificarAsercion, type AsercionWebAuthn } from '@/lib/news/webauthn'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const challengeCookieName = 'news-webauthn-challenge'
const challengeMaxAgeMs = 1000 * 60 * 5

// GET: challenge firmado + credenciales registradas (para allowCredentials del navegador).
export async function GET() {
  const challenge = randomBytes(32).toString('base64url')
  const credenciales = await leerCredencialesWebAuthn()

  const response = NextResponse.json({
    challenge,
    credenciales: credenciales.map((credencial) => credencial.id),
  })
  response.cookies.set(challengeCookieName, await createScopedToken('news-challenge', challengeMaxAgeMs, { challenge }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: challengeMaxAgeMs / 1000,
    path: '/',
  })

  return response
}

async function challengeDesdeCookie(request: NextRequest) {
  const token = request.cookies.get(challengeCookieName)?.value
  const payload = await readScopedToken(token, 'news-challenge')
  return typeof payload?.challenge === 'string' ? payload.challenge : null
}

// PUT: registrar una credencial nueva (el middleware exige cookie de sesión vigente).
export async function PUT(request: NextRequest) {
  const body = (await request.json()) as { id?: string; publicKey?: string; algorithm?: number }

  if (!body.id || !body.publicKey || typeof body.algorithm !== 'number') {
    return NextResponse.json({ mensaje: 'Payload inválido.' }, { status: 400 })
  }
  if (![-7, -257].includes(body.algorithm)) {
    return NextResponse.json({ mensaje: 'Algoritmo no soportado.' }, { status: 400 })
  }

  await guardarCredencialWebAuthn({
    id: body.id,
    publicKey: body.publicKey,
    algorithm: body.algorithm,
    creadaEn: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}

// POST: verificar una aserción (Face ID / Touch ID) y abrir sesión.
export async function POST(request: NextRequest) {
  const asercion = (await request.json()) as AsercionWebAuthn

  if (!asercion.id || !asercion.authenticatorData || !asercion.clientDataJSON || !asercion.signature) {
    return NextResponse.json({ mensaje: 'Payload inválido.' }, { status: 400 })
  }

  const challengeEsperado = await challengeDesdeCookie(request)
  if (!challengeEsperado) {
    return NextResponse.json({ mensaje: 'Challenge vencido. Probá de nuevo.' }, { status: 401 })
  }

  const credencial = (await leerCredencialesWebAuthn()).find((item) => item.id === asercion.id)
  if (!credencial) {
    return NextResponse.json({ mensaje: 'Credencial desconocida.' }, { status: 401 })
  }

  let valida = false
  try {
    valida = await verificarAsercion({
      asercion,
      credencial,
      challengeEsperado,
      origin: request.nextUrl.origin,
    })
  } catch {
    valida = false
  }

  if (!valida) {
    return NextResponse.json({ mensaje: 'No se pudo verificar la identidad.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(newsCookieName, await createNewsToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: newsTokenMaxAgeSeconds,
    path: '/',
  })
  response.cookies.delete(challengeCookieName)

  return response
}
