const encoder = new TextEncoder()

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (secret) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing ADMIN_SESSION_SECRET (or ADMIN_PASSWORD) in production.')
  }

  return 'guidowain-dev-secret'
}

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return atob(padded)
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  const bytes = Array.from(new Uint8Array(signature))
  return base64UrlEncode(String.fromCharCode(...bytes))
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

type TokenPayload = {
  scope: string
  exp: number
  [key: string]: unknown
}

export async function createScopedToken(scope: string, maxAgeMs: number, extra: Record<string, unknown> = {}) {
  const payload = base64UrlEncode(JSON.stringify({ ...extra, scope, exp: Date.now() + maxAgeMs }))
  const signature = await sign(payload)
  return `${payload}.${signature}`
}

export async function readScopedToken(token: string | undefined, scope: string): Promise<TokenPayload | null> {
  if (!token) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = await sign(payload)
  if (!timingSafeEqual(signature, expected)) return null

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as TokenPayload
    if (decoded.scope !== scope) return null
    if (typeof decoded.exp !== 'number' || decoded.exp <= Date.now()) return null
    return decoded
  } catch {
    return null
  }
}

const adminTokenMaxAgeMs = 1000 * 60 * 60 * 24 * 7

export async function createAdminToken(username: string) {
  return createScopedToken('admin', adminTokenMaxAgeMs, { username })
}

export async function verifyAdminToken(token: string | undefined) {
  return Boolean(await readScopedToken(token, 'admin'))
}

export function checkAdminCredentials(password: string) {
  const validPass = process.env.ADMIN_PASSWORD

  if (!validPass) return false
  return timingSafeEqual(password, validPass)
}

// ── Acceso a /news (PIN + WebAuthn) ──────────────────────────

export const newsCookieName = 'news-token'
const newsTokenMaxAgeMs = 1000 * 60 * 60 * 24 * 90

export function checkNewsPin(pin: string) {
  const expected = process.env.NEWS_PIN || '8790'
  return timingSafeEqual(pin, expected)
}

export async function createNewsToken() {
  return createScopedToken('news', newsTokenMaxAgeMs)
}

export async function verifyNewsToken(token: string | undefined) {
  return Boolean(await readScopedToken(token, 'news'))
}

export const newsTokenMaxAgeSeconds = newsTokenMaxAgeMs / 1000
