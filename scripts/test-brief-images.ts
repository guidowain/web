import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadBrief, loadEdition, loadReads, markReads, parseBrief, publishBrief } from '../src/lib/brief/storage'

async function main() {
  const cwd = process.cwd(), folder = await mkdtemp(path.join(tmpdir(), 'brief-images-'))
  const brief = parseBrief({ edicion_id: 'image-test', fecha: '2026-09-13', turno: 'manana', generado_en: '2026-09-13T12:00:00Z', noticias: [{ id: 'news1', categoria: 'Apple', fuente: 'Medio', titulo: 'Noticia', resumen: 'Resumen', url: 'https://example.org/news' }] })
  const photo = { url: 'https://images.example.org/cover.jpg?x=1&y=2', alt: 'Herramienta de diseño' }
  try {
    process.chdir(folder)
    await publishBrief(brief); await markReads([brief.edicion_id])
    const illustrated = parseBrief({ ...brief, noticias: [{ ...brief.noticias[0], imagen: photo }] })
    await publishBrief(illustrated)
    assert.deepEqual((await loadBrief())?.noticias[0].imagen, photo)
    assert.deepEqual((await loadEdition(brief.edicion_id))?.noticias[0].imagen, photo)
    assert.ok((await loadReads()).includes(brief.edicion_id), 'Agregar imágenes conserva la lectura')
    const encrypted = await readFile('data/brief/latest.enc', 'utf8')
    await publishBrief(brief); await publishBrief(illustrated)
    assert.equal(await readFile('data/brief/latest.enc', 'utf8'), encrypted, 'Reintentos idempotentes, sin eliminar imágenes')
    await assert.rejects(publishBrief(parseBrief({ ...illustrated, noticias: [{ ...illustrated.noticias[0], titulo: 'Cambio editorial' }] })))
    for (const url of ['javascript:alert(1)', 'http://images.example.org/a.jpg', 'https://127.0.0.1/a.jpg']) assert.throws(() => parseBrief({ ...brief, noticias: [{ ...brief.noticias[0], imagen: { ...photo, url } }] }))
    console.log('Imágenes: publicación, archivo, cifrado, lectura conservada y URLs verificadas.')
  } finally { process.chdir(cwd); await rm(folder, { recursive: true, force: true }) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
