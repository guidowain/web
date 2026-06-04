import { promises as fs } from 'fs'
import path from 'path'
import { getFileFromGithub, saveFilesToGithub } from '@/lib/admin/githubContent'
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
  }
}

export async function leerEstadoNoticias(): Promise<EstadoPersistenteNoticias> {
  try {
    const parsed = JSON.parse(await readText(estadoPath)) as EstadoPersistenteNoticias
    return {
      preferencias: parsed.preferencias ?? crearPreferenciasIniciales(),
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
      guardadas: Array.isArray(parsed.guardadas) ? parsed.guardadas : [],
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

export function briefPath(fecha: string) {
  return `${dataRoot}/briefs/${fecha}.json`
}

export async function leerBrief(fecha: string) {
  return JSON.parse(await readText(briefPath(fecha))) as BriefDiario
}

export async function guardarBrief(brief: BriefDiario) {
  await writeText(briefPath(brief.fecha), json(brief))
}

export async function listarFechasBriefs() {
  if (process.env.VERCEL) {
    const hoy = new Date().toISOString().slice(0, 10)
    const fechas = new Set([hoy])
    for (let index = 1; index <= 30; index += 1) {
      const fecha = new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      try {
        await leerBrief(fecha)
        fechas.add(fecha)
      } catch {
        // GitHub Contents API no lista carpetas en el helper actual; probamos una ventana chica.
      }
    }
    return Array.from(fechas).sort().reverse()
  }

  try {
    const dir = fullPath(`${dataRoot}/briefs`)
    const files = await fs.readdir(dir)
    return files.filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/, '')).sort().reverse()
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
