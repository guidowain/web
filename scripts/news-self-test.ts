import assert from 'node:assert/strict'
import { deduplicarNoticias, puntuarNoticias } from '../src/lib/news/scoring'
import { crearEstadoInicial } from '../src/lib/news/storage'
import { pedirBriefAGemini } from '../src/lib/news/gemini'
import type { NoticiaNormalizada } from '../src/lib/news/types'

const baseNews: NoticiaNormalizada = {
  id: 'n1',
  categoria: 'AI',
  fuente: 'OpenAI News',
  url: 'https://example.com/openai',
  tituloOriginal: 'OpenAI anuncia una mejora importante para agentes',
  tituloLimpio: 'OpenAI anuncia una mejora importante para agentes',
  resumen: 'La empresa presentó una mejora útil para automatización y productividad.',
  porQueImporta: '',
  publicadoEn: new Date().toISOString(),
  globalScore: 90,
  personalScore: 90,
  tags: ['openai', 'agentes', 'automatizacion'],
  tambienVistoEn: [],
}

const duplicated = deduplicarNoticias([
  baseNews,
  { ...baseNews, id: 'n2', fuente: 'TechCrunch AI', globalScore: 70 },
])
assert.equal(duplicated.length, 1, 'deduplica noticias repetidas')
assert.ok(duplicated[0].tambienVistoEn.length >= 1, 'registra fuentes alternativas')

const estado = crearEstadoInicial()
const scored = puntuarNoticias([baseNews], estado.preferencias, estado)
assert.ok(scored[0].personalScore >= scored[0].globalScore, 'aplica relevancia personal')

async function main() {
  const originalFetch = global.fetch
  process.env.GEMINI_API_KEY = 'test-key'
  global.fetch = (async () => new Response(JSON.stringify({
    candidates: [{
      content: {
        parts: [{
          text: JSON.stringify({
            resumenEjecutivo: 'Resumen en español.',
            radarPersonal: [],
            loImportante: ['Punto importante.'],
            oportunidades: [],
            riesgos: [],
            conexiones: [],
            noticias: [{
              id: 'n1',
              tituloLimpio: 'OpenAI mejora sus agentes',
              resumen: 'Resumen limpio.',
              porQueImporta: 'Puede mejorar automatizaciones.',
              tags: ['openai'],
            }],
          }),
        }],
      },
    }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

  const brief = await pedirBriefAGemini({ fecha: '2026-06-04', actualizacion: 'manual', noticias: [baseNews] })
  assert.equal(brief.noticias[0].tituloLimpio, 'OpenAI mejora sus agentes', 'parsea respuesta mock de Gemini')
  global.fetch = originalFetch

  console.log('Self-test de News Brief OK')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
