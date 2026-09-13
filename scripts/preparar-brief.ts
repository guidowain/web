import { promises as fs } from 'fs'
import { encrypt, parseBrief } from '../src/lib/brief/storage'

async function main() {
  const [input, tokenFile] = process.argv.slice(2)
  if (!input || !tokenFile) throw new Error('Faltan las rutas de entrada y credencial local')
  const brief = parseBrief(JSON.parse(await fs.readFile(input, 'utf8')))
  const token = process.env.BRIEF_PUBLISH_TOKEN
  if (!token) throw new Error('Falta BRIEF_PUBLISH_TOKEN')
  await fs.writeFile(tokenFile, token, { mode: 0o600 })
  await fs.chmod(tokenFile, 0o600)
  const ciphertext = encrypt(JSON.stringify(brief))
  await fs.writeFile('src/content/briefSeed.json', JSON.stringify({ ciphertext }))
  console.log(`Preparada edición ${brief.edicion_id}; credencial guardada localmente.`)
}
main().catch(() => { console.error('No se pudo preparar el brief. Revisá la configuración y las rutas.'); process.exitCode = 1 })
