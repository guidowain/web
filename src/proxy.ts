import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/auth'

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

export async function proxy(request: NextRequest) {
  if (request.headers.get('host')?.split(':')[0] === 'brief.guidowain.com' && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/brief', request.url))
  }
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()
  return handleAdmin(request)
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
