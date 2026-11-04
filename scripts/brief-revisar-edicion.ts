// Revisa una edición antes de publicarla: valida el formato y aplica las reglas de brief/REDACCION.md.
// Uso: npx tsx scripts/brief-revisar-edicion.ts edicion.json [--json]
// Sale con código 1 si la edición no es válida o tiene errores de calidad.
import { readFile } from 'node:fs/promises'
import { parseBrief } from '../src/lib/brief/storage'
import { revisarEdicion } from '../src/lib/brief/calidad'

async function main() {
  const [file, flag] = process.argv.slice(2)
  if (!file) throw new Error('Uso: npx tsx scripts/brief-revisar-edicion.ts edicion.json [--json]')
  let brief
  try { brief = parseBrief(JSON.parse(await readFile(file, 'utf8'))) }
  catch (error) {
    const result = { valida: false, error: (error as Error).message, avisos: [] }
    console.log(flag === '--json' ? JSON.stringify(result) : `Edición inválida: ${result.error}`)
    process.exitCode = 1
    return
  }
  const avisos = revisarEdicion(brief)
  const errores = avisos.filter(a => a.nivel === 'error').length
  if (flag === '--json') console.log(JSON.stringify({ valida: true, errores, avisos }))
  else {
    console.log(`${brief.edicion_id}: ${brief.noticias.length} noticias, ${errores} errores, ${avisos.length - errores} avisos y sugerencias.`)
    for (const a of avisos) console.log(`  [${a.nivel}] ${a.noticia ? a.noticia + ' · ' : ''}${a.regla}: ${a.detalle}`)
  }
  if (errores) process.exitCode = 1
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
