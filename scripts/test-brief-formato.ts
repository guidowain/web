import assert from 'node:assert/strict'
import { editionMoment, parseBrief } from '../src/lib/brief/storage'
import { parsePrefs } from '../src/lib/brief/render'

const base = { edicion_id: 'formato-test', fecha: '2026-11-04', turno: 'manana', generado_en: '2026-11-04T12:00:00Z',
  noticias: [{ id: 'n1', categoria: 'AI', fuente: 'Medio', titulo: 'Título', resumen: 'Resumen', url: 'https://example.org/a' }] }

// Compatibilidad: una edición sin campos nuevos queda igual.
assert.deepEqual(parseBrief(base), base)
// Campos editoriales opcionales.
const rich = parseBrief({ ...base, resumen: '  Resumen de la edición ', lo_importante: ['Uno', '', 'Dos'],
  noticias: [{ ...base.noticias[0], bajada: 'Bajada', claves: ['A', 'B'], por_que_importa: 'Porque sí', publicado_en: '2026-11-04T10:00:00Z', interno: 'no se publica' }] })
assert.equal(rich.resumen, 'Resumen de la edición')
assert.deepEqual(rich.lo_importante, ['Uno', 'Dos'])
assert.deepEqual(rich.noticias[0].claves, ['A', 'B'])
assert.equal(rich.noticias[0].bajada, 'Bajada')
assert.equal(rich.noticias[0].por_que_importa, 'Porque sí')
assert.ok(!('interno' in rich.noticias[0]), 'Los campos desconocidos se descartan')
// Vacíos se omiten en lugar de fallar.
assert.ok(!('claves' in parseBrief({ ...base, noticias: [{ ...base.noticias[0], claves: [] }] }).noticias[0]))
// Límites y tipos.
for (const bad of [{ bajada: 'x'.repeat(401) }, { claves: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { claves: 'texto' }, { claves: [1] },
  { por_que_importa: 'x'.repeat(601) }, { publicado_en: 'ayer' }]) {
  assert.throws(() => parseBrief({ ...base, noticias: [{ ...base.noticias[0], ...bad }] }), JSON.stringify(bad).slice(0, 40))
}
assert.throws(() => parseBrief({ ...base, lo_importante: Array(7).fill('x') }))
assert.throws(() => parseBrief({ ...base, resumen: 'x'.repeat(1201) }))
// IDs con fecha y hora.
assert.deepEqual(editionMoment('20261104-090004-269474'), { fecha: '2026-11-04', hora: '09:00', orden: '20261104090004' })
assert.equal(editionMoment('otro-formato'), null)
// Preferencias: solo valores conocidos.
assert.deepEqual(parsePrefs('oscuro.2.una'), { tema: 'oscuro', tamano: 2, modo: 'una' })
assert.deepEqual(parsePrefs('"><script>'), { tema: 'auto', tamano: 1, modo: 'lista' })
assert.deepEqual(parsePrefs(undefined), { tema: 'auto', tamano: 1, modo: 'lista' })
console.log('Formato: campos opcionales, compatibilidad, límites, fechas de edición y preferencias verificados.')
