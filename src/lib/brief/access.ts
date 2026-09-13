import { NextRequest } from 'next/server'
import { readScopedToken, verifyAdminToken } from '@/lib/admin/auth'
import { createHash, timingSafeEqual } from 'crypto'

export async function publisher(request: NextRequest) {
  const value = request.headers.get('authorization')
  const expected = process.env.BRIEF_PUBLISH_TOKEN
  if (!expected || !value?.startsWith('Bearer ')) return false
  return timingSafeEqual(createHash('sha256').update(value.slice(7)).digest(), createHash('sha256').update(expected).digest())
}

export async function reader(request: NextRequest) {
  return Boolean(await readScopedToken(request.cookies.get('brief-reader')?.value, 'brief-reader')) ||
    await verifyAdminToken(request.cookies.get('admin-token')?.value)
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
