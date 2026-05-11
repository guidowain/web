const encoder = new TextEncoder()

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'guidowain-dev-secret'
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

export async function createAdminToken(username: string) {
  const payload = base64UrlEncode(
    JSON.stringify({
      username,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
  )
  const signature = await sign(payload)

  return `${payload}.${signature}`
}

export async function verifyAdminToken(token: string | undefined) {
  if (!token) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = await sign(payload)
  if (signature !== expected) return false

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { exp?: number }
    return typeof decoded.exp === 'number' && decoded.exp > Date.now()
  } catch {
    return false
  }
}

export function checkAdminCredentials(password: string) {
  const validPass = process.env.ADMIN_PASSWORD

  if (!validPass) return false
  return password === validPass
}
