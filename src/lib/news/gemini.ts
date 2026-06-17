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

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
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

PERFIL DEL LECTOR (usalo para decidir relevancia): Guido vive en Buenos Aires, Argentina. Trabaja en retoque fotográfico y arte con IA, y le interesan la IA aplicada, Apple, marketing, automatización, herramientas y la inversión (ETFs, mercados). Por vivir en Argentina, NO tiene acceso a productos ni servicios exclusivos de otros países: tarjetas de crédito, bancos, planes, promociones, beneficios regionales o lanzamientos que solo aplican en EE.UU. u otros mercados a los que no puede acceder. Descartá ese tipo de noticias salvo que tengan impacto global real o sirvan a alguien en Argentina (por ejemplo, un producto que también llega acá, o una tendencia de la industria). Una promo de una tarjeta estadounidense, un beneficio bancario local de otro país o una oferta geográficamente restringida NO le sirven: dejalas afuera.

Objetivo: decidir qué entra y qué queda afuera. No resumas todo. Elegí solo lo que Guido debería leer.

FIDELIDAD ABSOLUTA (la regla más importante): para "tituloLimpio" y "resumen" solo podés usar información que esté explícitamente en el "tituloOriginal" y el "resumen" que te paso de cada noticia. Tenés PROHIBIDO agregar definiciones, cifras, nombres, fechas, causas, consecuencias o contexto que no estén en ese material. Si un término no está explicado en el texto que recibís (por ejemplo una sigla como "FOBO"), NO lo expliques ni inventes qué significa: dejalo tal como aparece. Reescribí y traducí al español rioplatense, sacando el clickbait, pero sin sumar ni un dato nuevo. Ante la duda, parafraseá lo que dice el material; nunca completes con tu conocimiento previo.

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
- Si una noticia es autopromocional, corporativa, menor, repetida o sin impacto práctico, excluila. Un comunicado de prensa en primera persona ("fortalecemos nuestra presencia...") es PR corporativo: excluilo o, si entra, reescribí el título en tercera persona como hecho.
- Relevancia geográfica: excluí productos o servicios que un residente de Argentina no puede usar (tarjetas de crédito o bancos de EE.UU. como Chase, Amex US o similares, promos, beneficios o planes de otros países), salvo que tengan impacto global real.
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

  const cuerpo = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.25,
      responseMimeType: 'application/json',
      // gemini-2.5-flash trae "thinking" activado y eso lo hace lento (timeouts).
      // Para curar/traducir noticias no hace falta; lo apagamos para que responda rápido.
      thinkingConfig: { thinkingBudget: 0 },
    },
  })

  // Reintentos con backoff: Gemini suele devolver 503/429 transitorios por sobrecarga.
  const reintentables = new Set([429, 500, 502, 503, 504])
  const maxIntentos = 4
  let response: Response | undefined
  let ultimoError = ''

  for (let intento = 1; intento <= maxIntentos; intento += 1) {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: cuerpo,
      signal: AbortSignal.timeout(60_000),
    }).catch((error) => {
      ultimoError = error instanceof Error ? error.message : 'fetch error'
      return undefined as unknown as Response
    })

    if (response?.ok) break

    const status = response?.status
    ultimoError = response ? `HTTP ${status}: ${await response.text()}` : ultimoError
    if (intento === maxIntentos || (status !== undefined && !reintentables.has(status))) {
      throw new Error(`Gemini fallo (${ultimoError})`)
    }
    // 2s, 4s, 8s
    await new Promise((resolve) => setTimeout(resolve, 2_000 * 2 ** (intento - 1)))
  }

  if (!response?.ok) {
    throw new Error(`Gemini fallo (${ultimoError})`)
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
