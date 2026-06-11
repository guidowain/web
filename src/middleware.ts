import { NextRequest, NextResponse } from 'next/server'
import { newsCookieName, verifyAdminToken, verifyNewsToken } from '@/lib/admin/auth'

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, '')
}

async function handleAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const isValid = await verifyAdminToken(request.cookies.get('admin-token')?.value)
  if (isValid) {
    return NextResponse.next()
  }

  const response = NextResponse.redirect(new URL('/admin/login', request.url))
  response.cookies.delete('admin-token')
  return response
}

async function handleNews(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pantalla de PIN y endpoints de desbloqueo (el registro de WebAuthn, PUT, sí exige sesión).
  if (pathname === '/news/pin' || pathname === '/api/news/desbloquear') {
    return NextResponse.next()
  }
  if (pathname === '/api/news/webauthn' && request.method !== 'PUT') {
    return NextResponse.next()
  }

  // El cron de Vercel genera el brief con CRON_SECRET, sin cookie.
  if (pathname === '/api/news/generar') {
    const cronSecret = cleanEnvValue(process.env.CRON_SECRET)
    if (cronSecret && request.headers.get('authorization') === `Bearer ${cronSecret}`) {
      return NextResponse.next()
    }
  }

  const isValid = await verifyNewsToken(request.cookies.get(newsCookieName)?.value)
  if (isValid) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ mensaje: 'No autorizado.' }, { status: 401 })
  }

  const loginUrl = new URL('/news/pin', request.url)
  if (pathname !== '/news') {
    loginUrl.searchParams.set('next', pathname)
  }
  const response = NextResponse.redirect(loginUrl)
  response.cookies.delete(newsCookieName)
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/news') || pathname.startsWith('/api/news')) {
    return handleNews(request)
  }

  return handleAdmin(request)
}

export const config = {
  matcher: ['/admin/:path*', '/news/:path*', '/api/news/:path*'],
}
