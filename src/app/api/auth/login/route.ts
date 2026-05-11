import { NextResponse } from 'next/server'
import { checkAdminCredentials, createAdminToken } from '@/lib/admin/auth'

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username?: string
    password?: string
  }

  if (!password || !checkAdminCredentials(password)) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const token = await createAdminToken(username || 'admin')
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
