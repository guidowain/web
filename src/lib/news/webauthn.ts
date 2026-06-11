import { createHash, webcrypto } from 'crypto'

export type CredencialWebAuthn = {
  id: string
  publicKey: string
  algorithm: number
  creadaEn: string
}

export type AsercionWebAuthn = {
  id: string
  authenticatorData: string
  clientDataJSON: string
  signature: string
}

function fromBase64Url(value: string) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

// WebCrypto espera firmas ECDSA en formato crudo r||s; los authenticators devuelven ASN.1 DER.
function derToRawEcdsa(der: Buffer, size = 32) {
  let offset = 2
  if (der[1] & 0x80) offset += der[1] & 0x7f

  function readInt() {
    if (der[offset] !== 0x02) throw new Error('Firma ECDSA inválida.')
    const length = der[offset + 1]
    let start = offset + 2
    let count = length
    while (count > size) {
      start += 1
      count -= 1
    }
    offset = offset + 2 + length
    const out = Buffer.alloc(size)
    der.copy(out, size - count, start, start + count)
    return out
  }

  const r = readInt()
  const s = readInt()
  return Buffer.concat([r, s])
}

async function importPublicKey(spkiBase64: string, algorithm: number) {
  const spki = Buffer.from(spkiBase64, 'base64')

  if (algorithm === -7) {
    return {
      key: await webcrypto.subtle.importKey('spki', spki, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']),
      params: { name: 'ECDSA', hash: 'SHA-256' } as EcdsaParams,
      ecdsa: true,
    }
  }

  if (algorithm === -257) {
    return {
      key: await webcrypto.subtle.importKey('spki', spki, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']),
      params: { name: 'RSASSA-PKCS1-v1_5' },
      ecdsa: false,
    }
  }

  throw new Error(`Algoritmo WebAuthn no soportado: ${algorithm}`)
}

export async function verificarAsercion(input: {
  asercion: AsercionWebAuthn
  credencial: CredencialWebAuthn
  challengeEsperado: string
  origin: string
}) {
  const { asercion, credencial, challengeEsperado, origin } = input

  const clientDataBytes = fromBase64Url(asercion.clientDataJSON)
  const clientData = JSON.parse(clientDataBytes.toString('utf8')) as {
    type?: string
    challenge?: string
    origin?: string
  }

  if (clientData.type !== 'webauthn.get') return false
  if (clientData.challenge !== challengeEsperado) return false
  if (clientData.origin !== origin) return false

  const authData = fromBase64Url(asercion.authenticatorData)
  if (authData.length < 37) return false

  const rpId = new URL(origin).hostname
  const expectedRpIdHash = createHash('sha256').update(rpId).digest()
  if (!authData.subarray(0, 32).equals(expectedRpIdHash)) return false

  const flags = authData[32]
  const userPresent = (flags & 0x01) !== 0
  const userVerified = (flags & 0x04) !== 0
  if (!userPresent || !userVerified) return false

  const { key, params, ecdsa } = await importPublicKey(credencial.publicKey, credencial.algorithm)
  const clientDataHash = createHash('sha256').update(clientDataBytes).digest()
  const signedData = Buffer.concat([authData, clientDataHash])
  const rawSignature = fromBase64Url(asercion.signature)
  const signature = ecdsa ? derToRawEcdsa(rawSignature) : rawSignature

  return webcrypto.subtle.verify(params, key, signature, signedData)
}
