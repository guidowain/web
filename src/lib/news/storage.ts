import { promises as fs } from 'fs'
import path from 'path'
import { revalidateTag, unstable_cache } from 'next/cache'
import { getFileFromGithub, listDirFromGithub, saveFilesToGithub } from '@/lib/admin/githubContent'
import { crearPreferenciasIniciales } from './config'
import type { BriefDiario, EstadoPersistenteNoticias, NoticiaGuardada, PreferenciasNoticias } from './types'

const dataRoot = 'data/news'
const estadoPath = `${dataRoot}/estado.json`

function fullPath(filePath: string) {
  return path.join(process.cwd(), filePath)
}

async function readText(filePath: string) {
  if (process.env.VERCEL) {
    try {
      return (await getFileFromGithub(filePath)).toString('utf8')
    } catch {
      return await fs.readFile(fullPath(filePath), 'utf8')
    }
  }

  return await fs.readFile(fullPath(filePath), 'utf8')
}

async function writeText(filePath: string, content: string) {
  if (process.env.VERCEL) {
    await saveFilesToGithub([{ path: filePath, contentBase64: Buffer.from(content, 'utf8').toString('base64') }])
    return
  }

  await fs.mkdir(path.dirname(fullPath(filePath)), { recursive: true })
  await fs.writeFile(fullPath(filePath), content, 'utf8')
}

function json<T>(value: T) {
  return `${JSON.stringify(value, null, 2)}\n`
}

export function crearEstadoInicial(): EstadoPersistenteNoticias {
  return {
    preferencias: crearPreferenciasIniciales(),
    feedback: [],
    guardadas: [],
    credencialesWebAuthn: [],
  }
}

export async function leerEstadoNoticias(): Promise<EstadoPersistenteNoticias> {
  try {
    const parsed = JSON.parse(await readText(estadoPath)) as EstadoPersistenteNoticias
    return {
      preferencias: parsed.preferencias ?? crearPreferenciasIniciales(),
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
      guardadas: Array.isArray(parsed.guardadas) ? parsed.guardadas : [],
      credencialesWebAuthn: Array.isArray(parsed.credencialesWebAuthn) ? parsed.credencialesWebAuthn : [],
    }
  } catch {
    return crearEstadoInicial()
  }
}

export async function guardarEstadoNoticias(estado: EstadoPersistenteNoticias) {
  await writeText(estadoPath, json(estado))
}

export async function leerPreferenciasNoticias() {
  return (await leerEstadoNoticias()).preferencias
}

export async function guardarPreferenciasNoticias(preferencias: PreferenciasNoticias) {
  const estado = await leerEstadoNoticias()
  estado.preferencias = { ...preferencias, actualizadoEn: new Date().toISOString() }
  await guardarEstadoNoticias(estado)
  return estado.preferencias
}

export async function leerGuardadas() {
  return (await leerEstadoNoticias()).guardadas
}

export async function guardarNoticiaGuardada(guardada: NoticiaGuardada) {
  const estado = await leerEstadoNoticias()
  const sinDuplicado = estado.guardadas.filter((item) => item.noticiaId !== guardada.noticiaId)
  estado.guardadas = [guardada, ...sinDuplicado]
  await guardarEstadoNoticias(estado)
  return estado.guardadas
}

export async function quitarNoticiaGuardada(noticiaId: string) {
  const estado = await leerEstadoNoticias()
  estado.guardadas = estado.guardadas.filter((item) => item.noticiaId !== noticiaId)
  await guardarEstadoNoticias(estado)
  return estado.guardadas
}

export async function leerCredencialesWebAuthn() {
  return (await leerEstadoNoticias()).credencialesWebAuthn
}

export async function guardarCredencialWebAuthn(credencial: EstadoPersistenteNoticias['credencialesWebAuthn'][number]) {
  const estado = await leerEstadoNoticias()
  estado.credencialesWebAuthn = [
    credencial,
    ...estado.credencialesWebAuthn.filter((item) => item.id !== credencial.id),
  ].slice(0, 10)
  await guardarEstadoNoticias(estado)
  return estado.credencialesWebAuthn
}

export function briefPath(fecha: string) {
  return `${dataRoot}/briefs/${fecha}.json`
}

const briefsTag = 'news-briefs'

// unstable_cache y revalidateTag solo funcionan dentro del runtime de Next;
// scripts/generar-news.ts usa este módulo desde un proceso suelto.
const enRuntimeDeNext = () => Boolean(process.env.NEXT_RUNTIME)

async function leerBriefDirecto(fecha: string) {
  return JSON.parse(await readText(briefPath(fecha))) as BriefDiario
}

const leerBriefCacheada = unstable_cache(leerBriefDirecto, ['news-brief'], {
  tags: [briefsTag],
  revalidate: 600,
})

export async function leerBrief(fecha: string) {
  return enRuntimeDeNext() ? leerBriefCacheada(fecha) : leerBriefDirecto(fecha)
}

export async function guardarBrief(brief: BriefDiario) {
  await writeText(briefPath(brief.fecha), json(brief))
  if (enRuntimeDeNext()) {
    revalidateTag(briefsTag)
  }
}

async function listarFechasBriefsDirecto() {
  if (process.env.VERCEL) {
    const files = await listDirFromGithub(`${dataRoot}/briefs`)
    return files.filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/, '')).sort().reverse()
  }

  const dir = fullPath(`${dataRoot}/briefs`)
  const files = await fs.readdir(dir)
  return files.filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/, '')).sort().reverse()
}

const listarFechasBriefsCacheada = unstable_cache(listarFechasBriefsDirecto, ['news-fechas-briefs'], {
  tags: [briefsTag],
  revalidate: 600,
})

export async function listarFechasBriefs() {
  try {
    return enRuntimeDeNext() ? await listarFechasBriefsCacheada() : await listarFechasBriefsDirecto()
  } catch {
    return []
  }
}

export async function leerUltimoBrief() {
  const fechas = await listarFechasBriefs()
  for (const fecha of fechas) {
    try {
      return await leerBrief(fecha)
    } catch {
      // seguimos buscando un brief legible
    }
  }
  return null
}
