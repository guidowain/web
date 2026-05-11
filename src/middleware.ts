import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/auth'

export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: ['/admin/:path*'],
}
