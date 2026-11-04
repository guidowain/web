import { NextRequest } from 'next/server'
import { createScopedToken, readScopedToken, verifyAdminToken } from '@/lib/admin/auth'
import { createHash, timingSafeEqual } from 'crypto'

export async function publisher(request: NextRequest) {
  const value = request.headers.get('authorization')
  const expected = process.env.BRIEF_PUBLISH_TOKEN
  if (!expected || !value?.startsWith('Bearer ')) return false
  return timingSafeEqual(createHash('sha256').update(value.slice(7)).digest(), createHash('sha256').update(expected).digest())
}

export async function reader(request: NextRequest) {
  return Boolean(await readerSession(request))
}

const readerMaxAge = 30 * 86400
export async function readerSession(request: NextRequest): Promise<null | { renew: boolean }> {
  const payload = await readScopedToken(request.cookies.get('brief-reader')?.value, 'brief-reader')
  // Sesión deslizante: si se usa seguido, nunca vence.
  if (payload) return { renew: payload.exp - Date.now() < (readerMaxAge - 86400) * 1000 }
  return await verifyAdminToken(request.cookies.get('admin-token')?.value) ? { renew: false } : null
}

export async function readerCookie() {
  const token = await createScopedToken('brief-reader', readerMaxAge * 1000)
  return { name: 'brief-reader', value: token, options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: readerMaxAge } }
}

export function serializeCookie({ name, value, options }: Awaited<ReturnType<typeof readerCookie>>) {
  return `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly; SameSite=Lax${options.secure ? '; Secure' : ''}`
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0] || request.nextUrl.protocol.replace(':', '')
  return Boolean(host && origin === `${protocol}://${host}`)
}

export async function smallJson(request: NextRequest, limit = 100_000): Promise<unknown> {
  const stream = request.body?.getReader()
  if (!stream) throw new Error('Solicitud vacía')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const chunk = await stream.read()
    if (chunk.done) break
    size += chunk.value.byteLength
    if (size > limit) { await stream.cancel(); throw new Error('Solicitud demasiado grande') }
    chunks.push(chunk.value)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
