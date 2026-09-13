import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import http from 'node:http'
import { createScopedToken } from '../src/lib/admin/auth'
import { decrypt, encrypt, parseBrief } from '../src/lib/brief/storage'

async function main() {
  const base = process.env.BRIEF_TEST_BASE || 'http://127.0.0.1:3000'
  assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(base), 'Las pruebas solo pueden escribir en el servidor local')
  const token = process.env.BRIEF_PUBLISH_TOKEN!
  const machine = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  let response = await fetch(base + '/brief', { redirect: 'manual' })
  assert.equal(response.status, 307)
  assert.ok(response.headers.get('location')?.endsWith('/brief/login'))
  assert.equal((await fetch(base + '/api/brief/latest')).status, 401)
  assert.equal((await fetch(base + '/api/brief/latest', { headers: { Authorization: 'Bearer wrong' }, method: 'POST', body: '{}' })).status, 401)

  const original = await (await fetch(base + '/api/brief/latest', { headers: machine })).json()
  assert.ok(original.noticias.length > 0)
  const cipher = encrypt(JSON.stringify(original))
  assert.ok(!cipher.includes(original.edicion_id))
  assert.deepEqual(JSON.parse(decrypt(cipher)), original)
  const damaged = Buffer.from(cipher, 'base64'); damaged[damaged.length - 1] ^= 1
  assert.throws(() => decrypt(damaged.toString('base64')))
  assert.throws(() => parseBrief({ ...original, noticias: [{ ...original.noticias[0], url: 'javascript:alert(1)' }] }))
  assert.throws(() => parseBrief({ ...original, noticias: [original.noticias[0], original.noticias[0]] }))

  for (let i = 0; i < 2; i++) {
    response = await fetch(base + '/api/brief/latest', { method: 'POST', headers: machine, body: JSON.stringify(original) })
    assert.equal(response.status, 200)
  }
  response = await fetch(base + '/api/brief/latest', { method: 'POST', headers: machine,
    body: JSON.stringify({ ...original, noticias: [{ ...original.noticias[0], url: 'javascript:alert(1)' }] }) })
  assert.equal(response.status, 400)
  response = await fetch(base + '/api/brief/latest', { method: 'POST', headers: machine,
    body: JSON.stringify({ ...original, noticias: [{ ...original.noticias[0], titulo: 'Otro contenido con el mismo ID' }] }) })
  assert.equal(response.status, 503)
  assert.deepEqual(await (await fetch(base + '/api/brief/latest', { headers: machine })).json(), original)

  response = await fetch(base + '/api/brief/login', { method: 'POST',
    headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'wrong' }) })
  assert.equal(response.status, 401)
  response = await fetch(base + '/api/brief/login', { method: 'POST',
    headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.NEWS_PIN }) })
  assert.equal(response.status, 200)
  const cookie = response.headers.get('set-cookie')!.split(';')[0]
  assert.ok(response.headers.get('set-cookie')!.includes('HttpOnly'))
  response = await fetch(base + '/api/brief/lecturas', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://attacker.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [original.edicion_id] }) })
  assert.equal(response.status, 401)
  response = await fetch(base + '/api/brief/lecturas', { method: 'POST', headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [original.edicion_id] }) })
  assert.equal(response.status, 200)
  const reads = await (await fetch(base + '/api/brief/lecturas', { headers: machine })).json()
  assert.ok(reads.ids.includes(original.edicion_id))
  assert.ok(!(await readFile('data/brief/lecturas.enc', 'utf8')).includes(original.edicion_id))
  const readerToken = await createScopedToken('brief-reader', 60_000)
  response = await fetch(base + '/api/brief/latest', { method: 'POST', headers: { Authorization: 'Bearer ' + readerToken }, body: JSON.stringify(original) })
  assert.equal(response.status, 401)
  response = await fetch(base + '/brief', { headers: { Cookie: cookie } })
  const html = await response.text()
  assert.equal(response.status, 200)
  assert.equal((html.match(/>Original<\/a>/g) || []).length, original.noticias.length)
  assert.ok(response.headers.get('content-security-policy')?.includes('sha256-'))
  assert.equal((html.match(/data-feedback=/g) || []).length, original.noticias.length)
  const feedback = { id: 'test-feedback-local', edicion_id: original.edicion_id, noticia_id: original.noticias[0].id, valor: 'no_util', comentario: 'Quiero mayor desarrollo, sin repetir el titular.' }
  assert.equal((await fetch(base + '/api/brief/feedback')).status, 401)
  assert.equal((await fetch(base + '/api/brief/feedback', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://other.example', 'Content-Type': 'application/json' }, body: JSON.stringify(feedback) })).status, 401)
  for (let i = 0; i < 2; i++) assert.equal((await fetch(base + '/api/brief/feedback', { method: 'POST', headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify(feedback) })).status, 200)
  const received = await (await fetch(base + '/api/brief/feedback', { headers: machine })).json()
  assert.equal(received.feedback.filter((f: {id: string}) => f.id === feedback.id).length, 1)
  assert.equal(received.feedback.find((f: {id: string}) => f.id === feedback.id).titulo, original.noticias[0].titulo)
  assert.ok(!(await readFile('data/brief/feedback.enc', 'utf8')).includes(feedback.comentario))
  assert.equal((await fetch(base + '/api/brief/feedback', { method: 'POST', headers: machine, body: JSON.stringify({ ...feedback, id: 'bad-news-test', noticia_id: 'does-not-exist' }) })).status, 400)
  const rewritten = await new Promise<string>((resolve, reject) => {
    http.get(base + '/', { headers: { Cookie: cookie, Host: 'brief.guidowain.com' } }, res => {
      let text = ''; res.on('data', chunk => text += chunk); res.on('end', () => resolve(text))
    }).on('error', reject)
  })
  assert.ok(rewritten.includes(original.edicion_id))
  console.log('Brief: cifrado, autenticación, publicación idempotente, enlaces, lectura y subdominio verificados.')
}
main().catch(error => { console.error(error.stack); process.exitCode = 1 })
