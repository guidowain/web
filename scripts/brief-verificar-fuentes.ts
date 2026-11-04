// Verifica las fuentes de brief/fuentes.json desde una máquina con red (el Mac).
// Uso: npx tsx scripts/brief-verificar-fuentes.ts [ruta/fuentes.json] [--json]
// Para cada feed informa si responde, cuántas notas trae y la antigüedad de la más reciente.
// Si la URL devuelve HTML, busca el <link rel="alternate"> del sitio y lo propone como reemplazo.
import { readFile } from 'node:fs/promises'

type Fuente = { id: string; nombre: string; url: string; categoria: string }
type Resultado = { id: string; nombre: string; url: string; estado: 'ok' | 'vieja' | 'falla'; notas: number; ultima_horas: number | null; detalle: string; reemplazo?: string }

const agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

function newest(xml: string) {
  const dates = Array.from(xml.matchAll(/<(pubDate|updated|published|dc:date)>([^<]+)<\/\1>/g)).map(m => Date.parse(m[2].trim())).filter(Number.isFinite)
  return dates.length ? Math.max(...dates) : null
}

async function check(source: Fuente): Promise<Resultado> {
  const base = { id: source.id, nombre: source.nombre, url: source.url }
  try {
    const response = await fetch(source.url, { headers: { 'User-Agent': agent, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' }, redirect: 'follow', signal: AbortSignal.timeout(20_000) })
    const body = await response.text()
    if (!response.ok) return { ...base, estado: 'falla', notas: 0, ultima_horas: null, detalle: `HTTP ${response.status}` }
    const items = (body.match(/<item[\s>]/g) || []).length + (body.match(/<entry[\s>]/g) || []).length
    if (!items) {
      const alt = /<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]*>/i.exec(body)?.[0]
      const href = alt && /href=["']([^"']+)["']/i.exec(alt)?.[1]
      return { ...base, estado: 'falla', notas: 0, ultima_horas: null, detalle: 'No es un feed (sin <item> ni <entry>)', ...(href ? { reemplazo: new URL(href, response.url).toString() } : {}) }
    }
    const last = newest(body)
    const hours = last ? Math.round((Date.now() - last) / 36e5) : null
    const moved = response.url !== source.url ? ` · redirige a ${response.url}` : ''
    return { ...base, estado: hours !== null && hours > 24 * 7 ? 'vieja' : 'ok', notas: items, ultima_horas: hours, detalle: `${items} notas${hours === null ? '' : `, la última hace ${hours} h`}${moved}` }
  } catch (error) {
    return { ...base, estado: 'falla', notas: 0, ultima_horas: null, detalle: (error as Error).name === 'TimeoutError' ? 'Sin respuesta en 20 s' : (error as Error).message }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const file = args.find(a => !a.startsWith('--')) || 'brief/fuentes.json'
  const config = JSON.parse(await readFile(file, 'utf8'))
  const sources: Fuente[] = [...config.fuentes, ...(config.busquedas?.lista || [])]
  const results: Resultado[] = []
  for (let i = 0; i < sources.length; i += 8) results.push(...await Promise.all(sources.slice(i, i + 8).map(check)))
  if (args.includes('--json')) { console.log(JSON.stringify(results, null, 2)); return }
  const icon = { ok: '✓', vieja: '·', falla: '✗' }
  for (const r of results) console.log(`${icon[r.estado]} ${r.id.padEnd(22)} ${r.detalle}${r.reemplazo ? `\n    reemplazo sugerido: ${r.reemplazo}` : ''}`)
  const fails = results.filter(r => r.estado === 'falla').length
  console.log(`\n${results.length - fails} de ${results.length} fuentes responden; ${fails} fallan; ${results.filter(r => r.estado === 'vieja').length} sin notas en la última semana.`)
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
