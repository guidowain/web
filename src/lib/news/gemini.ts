import type { BriefDiario, NoticiaNormalizada } from './types'

type GeminiPart = { text?: string }
type GeminiResponse = { candidates?: { content?: { parts?: GeminiPart[] } }[] }

function extractJson(value: string) {
  const cleaned = value.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Gemini no devolvio JSON valido.')
  return cleaned.slice(start, end + 1)
}

export async function pedirBriefAGemini(input: {
  fecha: string
  actualizacion: BriefDiario['actualizacion']
  noticias: NoticiaNormalizada[]
}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY.')

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const noticias = input.noticias.slice(0, 60).map((item) => ({
    id: item.id,
    categoria: item.categoria,
    fuente: item.fuente,
    url: item.url,
    tituloOriginal: item.tituloOriginal,
    resumen: item.resumen,
    publicadoEn: item.publicadoEn,
    globalScore: item.globalScore,
    personalScore: item.personalScore,
    tags: item.tags,
    tambienVistoEn: item.tambienVistoEn,
  }))

  const prompt = `
Sos el editor personal de noticias de Guido Wain. Respondé SIEMPRE en español rioplatense claro, sobrio y útil.

Objetivo: decidir qué entra y qué queda afuera. No resumas todo. Elegí solo lo que Guido debería leer.

Devolvé únicamente JSON válido con esta forma:
{
  "resumenEjecutivo": "string",
  "radarPersonal": [{"id":"string","titulo":"string","resumen":"string","categoria":"AI|Apple|Finance|Argentina|Business|Marketing|Tools & Automation|General","fuentes":["string"],"urls":["string"],"score":number,"tags":["string"]}],
  "loImportante": ["string"],
  "oportunidades": [{"id":"string","categoria":"DRAMA|Investing|Automation|AI|Marketing|Productivity","titulo":"string","detalle":"string","acciones":["string"]}],
  "riesgos": [{"id":"string","categoria":"Market|Regulatory|Technology|Platform|SEO|AI","titulo":"string","detalle":"string","mitigacion":"string"}],
  "conexiones": [{"id":"string","titulo":"string","historias":["string"],"conclusion":"string"}],
  "noticias": [{"id":"string","tituloLimpio":"string","resumen":"string","porQueImporta":"string","tags":["string"]}]
}

Reglas editoriales clave:
- La salida visible principal es "noticias". Elegí entre 8 y 18 noticias, salvo que haya menos material bueno.
- Diversidad obligatoria: no más de 3 noticias de la misma fuente.
- No llenes con OpenAI si hay Apple, Argentina, finanzas, marketing, herramientas o negocios con buena señal.
- Si una noticia es autopromocional, corporativa, menor, repetida o sin impacto práctico, excluila.
- Priorizá impacto directo para Guido: AI aplicada, Apple, inversión/ETFs, Argentina y marketing.
- Radar Personal máximo 5, solo si hay algo realmente personal.
- Lo Importante máximo 5 bullets.
- Oportunidades máximo 3.
- Riesgos máximo 3.
- No inventes fuentes ni URLs.
- Mantené los ids originales cuando limpies noticias.
- Nunca muestres clickbait: reescribí títulos como hechos concretos.
- Si hay pocas noticias importantes, devolvé pocas. Es mejor corto que relleno.

Fecha: ${input.fecha}
Actualización: ${input.actualizacion}
Noticias normalizadas:
${JSON.stringify(noticias)}
`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini fallo con HTTP ${response.status}: ${await response.text()}`)
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || ''
  return JSON.parse(extractJson(text)) as {
    resumenEjecutivo: string
    radarPersonal: BriefDiario['radarPersonal']
    loImportante: string[]
    oportunidades: BriefDiario['oportunidades']
    riesgos: BriefDiario['riesgos']
    conexiones: BriefDiario['conexiones']
    noticias: { id: string; tituloLimpio: string; resumen: string; porQueImporta: string; tags: string[] }[]
  }
}
