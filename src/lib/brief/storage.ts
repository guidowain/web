import { promises as fs } from 'fs'
import path from 'path'
import { isIP } from 'net'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { getFileFromGithub, updateFileFromGithub } from '@/lib/admin/githubContent'
import seed from '@/content/briefSeed.json'

export type Brief = {
  edicion_id: string; fecha: string; turno: 'manana' | 'tarde'; generado_en: string
  noticias: { id: string; categoria: string; fuente: string; titulo: string; resumen: string; url: string; imagen?: { url: string; alt: string }; fuentes_resumen?: { nombre: string; url: string }[] }[]
}
export const validId = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value)
const latestPath = 'data/brief/latest.enc'
const readsPath = 'data/brief/lecturas.enc'
function localPath(file: string) {
  if (!file.startsWith('data/brief/') || file.includes('..')) throw new Error('Ruta inválida')
  return path.join(process.cwd(), 'data', 'brief', file.slice('data/brief/'.length))
}

export function parseBrief(input: unknown): Brief {
  if (!input || typeof input !== 'object') throw new Error('Edición inválida')
  const value = input as Brief
  if (!validId(value.edicion_id) || !/^\d{4}-\d{2}-\d{2}$/.test(value.fecha) ||
      !['manana', 'tarde'].includes(value.turno) || !Number.isFinite(Date.parse(value.generado_en)) ||
      !Array.isArray(value.noticias) || value.noticias.length > 14) throw new Error('Edición inválida')
  const seen = new Set<string>()
  const noticias = value.noticias.map(item => {
    if (!item || !validId(item.id) || seen.has(item.id)) throw new Error('Noticia inválida')
    seen.add(item.id)
    for (const field of ['categoria', 'fuente', 'titulo', 'resumen', 'url'] as const) {
      if (typeof item[field] !== 'string' || !item[field].trim() || item[field].length > 4000) throw new Error('Texto inválido')
    }
    const url = new URL(item.url)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Enlace inválido')
    const sources = item.fuentes_resumen
    if (sources !== undefined && (!Array.isArray(sources) || sources.length > 3 || sources.some(s => {
      if (!s || typeof s.nombre !== 'string' || !s.nombre.trim() || s.nombre.length > 200 || typeof s.url !== 'string') return true
      try { const u = new URL(s.url); return !['http:', 'https:'].includes(u.protocol) || Boolean(u.username || u.password) } catch { return true }
    }))) throw new Error('Fuente inválida')
    const image = item.imagen
    if (image !== undefined) {
      if (!image || typeof image.url !== 'string' || image.url.length > 4000 || typeof image.alt !== 'string' || image.alt.length > 300) throw new Error('Imagen inválida')
      const u = new URL(image.url)
      if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || isIP(u.hostname.replace(/[\[\]]/g, '')) || u.hostname === 'localhost' || u.hostname.endsWith('.localhost') || u.hostname.endsWith('.local')) throw new Error('Imagen inválida')
    }
    return { id: item.id, categoria: item.categoria, fuente: item.fuente,
      titulo: item.titulo, resumen: item.resumen, url: item.url,
      ...(image ? { imagen: { url: image.url, alt: image.alt } } : {}),
      ...(sources ? { fuentes_resumen: sources.map(s => ({ nombre: s.nombre, url: s.url })) } : {}) }
  })
  return { edicion_id: value.edicion_id, fecha: value.fecha, turno: value.turno,
    generado_en: value.generado_en, noticias }
}

async function read(file: string): Promise<string | null> {
  try {
    if (process.env.VERCEL) return (await getFileFromGithub(file)).toString('utf8')
    return await fs.readFile(localPath(file), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || String(error).includes('GitHub API error 404:')) return null
    throw error
  }
}

let localQueue: Promise<unknown> = Promise.resolve()
async function update(file: string, transform: (old: string | null) => string | null) {
  if (process.env.VERCEL) return updateFileFromGithub(file, transform)
  const operation = localQueue.then(async () => {
    const next = transform(await read(file))
    if (next === null) return
    const output = localPath(file)
    await fs.mkdir(path.dirname(output), { recursive: true })
    const temp = output + '.' + randomBytes(8).toString('hex') + '.tmp'
    await fs.writeFile(temp, next, { mode: 0o600 })
    await fs.rename(temp, output)
  })
  localQueue = operation.catch(() => {})
  return operation
}

export async function loadBrief(): Promise<Brief | null> {
  let data = await read(latestPath)
  if (!data) data = seed.ciphertext || null
  return data ? parseBrief(JSON.parse(decrypt(data))) : null
}

export async function loadEdition(id: string): Promise<Brief | null> {
  if (!validId(id)) return null
  const latest = await loadBrief()
  if (latest?.edicion_id === id) return latest
  const data = await read(`data/brief/ediciones/${id}.enc`)
  return data ? parseBrief(JSON.parse(decrypt(data))) : null
}

export type Feedback = { id: string; edicion_id: string; noticia_id: string; valor: 'util' | 'no_util'; comentario: string; creado_en: string; titulo: string; categoria: string; fuente: string; url: string }
export async function loadFeedback(): Promise<Feedback[]> {
  const data = await read('data/brief/feedback.enc')
  return data ? JSON.parse(decrypt(data)) : []
}
export async function saveFeedback(record: Feedback) {
  await update('data/brief/feedback.enc', old => {
    const records: Feedback[] = old ? JSON.parse(decrypt(old)) : []
    const prior = records.find(r => r.id === record.id)
    if (prior) {
      if (prior.edicion_id !== record.edicion_id || prior.noticia_id !== record.noticia_id || prior.valor !== record.valor || prior.comentario !== record.comentario) throw new Error('Feedback incompatible')
      return null
    }
    if (records.length >= 5000) throw new Error('Registro lleno')
    return encrypt(JSON.stringify([...records, record]))
  })
}

function mergeImages(previous: Brief, incoming: Brief): Brief {
  const editorial = (brief: Brief) => JSON.stringify({ ...brief, noticias: brief.noticias.map(({ imagen: _image, ...item }) => item) })
  if (editorial(previous) !== editorial(incoming)) throw new Error('El ID ya pertenece a otra edición')
  return parseBrief({ ...incoming, noticias: incoming.noticias.map((item, index) => {
    const prior = previous.noticias[index].imagen
    if (prior && item.imagen && JSON.stringify(prior) !== JSON.stringify(item.imagen)) throw new Error('La imagen ya está publicada')
    return { ...item, ...(prior ? { imagen: prior } : {}) }
  }) })
}

export async function publishBrief(brief: Brief) {
  const encoded = JSON.stringify(brief)
  await update(`data/brief/ediciones/${brief.edicion_id}.enc`, old => {
    if (!old) return encrypt(encoded)
    const prior = parseBrief(JSON.parse(decrypt(old)))
    const next = JSON.stringify(mergeImages(prior, brief))
    return JSON.stringify(prior) === next ? null : encrypt(next)
  })
  await update(latestPath, old => {
    if (old) {
      const prior = parseBrief(JSON.parse(decrypt(old)))
      if (prior.edicion_id === brief.edicion_id) {
        const next = JSON.stringify(mergeImages(prior, brief))
        return JSON.stringify(prior) === next ? null : encrypt(next)
      }
      if (Date.parse(prior.generado_en) >= Date.parse(brief.generado_en)) throw new Error('La edición es anterior a la publicada')
    }
    return encrypt(encoded)
  })
}

function stateKey() {
  const secret = process.env.BRIEF_STORAGE_SECRET
  if (!secret) throw new Error('Falta configurar el acceso del sitio')
  return createHash('sha256').update('brief-storage:' + secret).digest()
}

export function decrypt(value: string): string {
  const data = Buffer.from(value, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', stateKey(), data.subarray(0, 12))
  decipher.setAuthTag(data.subarray(12, 28))
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8')
}

export function decodeReads(value: string | null): string[] {
  if (!value) return []
  const result = JSON.parse(decrypt(value))
  if (!Array.isArray(result) || !result.every(validId)) throw new Error('Registro de lectura inválido')
  return result
}

export function encrypt(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', stateKey(), iv)
  const data = Buffer.concat([cipher.update(value), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64')
}

export function encodeReads(ids: string[]) { return encrypt(JSON.stringify(ids)) }

export async function loadReads() { return decodeReads(await read(readsPath)) }

export async function markReads(ids: string[]) {
  await update(readsPath, old => {
    const previous = decodeReads(old)
    const merged = Array.from(new Set([...previous, ...ids])).slice(-1000)
    return ids.every(id => previous.includes(id)) ? null : encodeReads(merged)
  })
}
