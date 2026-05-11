import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/auth'
import { saveFilesToGithub } from '@/lib/admin/githubContent'
import { loadSiteContent } from '@/lib/admin/siteContentStore'
import type { PendingImage, SiteContent } from '@/lib/admin/contentTypes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type SaveRequest = {
  content: SiteContent
  images: PendingImage[]
}

function isValidContent(content: SiteContent) {
  return Boolean(
    content?.translations?.en &&
      content?.translations?.es &&
      content?.contact?.email &&
      Array.isArray(content?.slides) &&
      content?.cv?.profile?.name &&
      Array.isArray(content?.cv?.experience) &&
      Array.isArray(content?.cv?.skills),
  )
}

function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/)
  if (!match) {
    throw new Error('Invalid image data')
  }

  return Buffer.from(match[2], 'base64')
}

function sanitizePublicImagePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')

  if (!normalized.startsWith('/images/') || normalized.includes('..')) {
    throw new Error('Images must be saved inside /images')
  }

  return normalized
}

async function saveLocal(content: SiteContent, images: PendingImage[]) {
  const root = process.cwd()
  await fs.writeFile(
    path.join(root, 'src/content/site.json'),
    `${JSON.stringify(content, null, 2)}\n`,
    'utf8',
  )

  for (const image of images) {
    const publicPath = sanitizePublicImagePath(image.path)
    const outputPath = path.join(root, 'public', publicPath)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, decodeDataUrl(image.dataUrl))
  }

  return content
}

async function saveProduction(content: SiteContent, images: PendingImage[]) {
  const files = [
    {
      path: 'src/content/site.json',
      contentBase64: Buffer.from(`${JSON.stringify(content, null, 2)}\n`, 'utf8').toString('base64'),
    },
    ...images.map((image) => {
      const publicPath = sanitizePublicImagePath(image.path)

      return {
        path: `public${publicPath}`,
        contentBase64: decodeDataUrl(image.dataUrl).toString('base64'),
      }
    }),
  ]

  await saveFilesToGithub(files)
  return await loadSiteContent()
}

async function verifyRequest(request: NextRequest) {
  const isValidSession = await verifyAdminToken(request.cookies.get('admin-token')?.value)
  if (!isValidSession) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const authError = await verifyRequest(request)
    if (authError) return authError

    const content = await loadSiteContent()
    return NextResponse.json(content)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.'
    return NextResponse.json({ message }, { status: 500 })
  }
}

async function saveRequest(request: NextRequest) {
  try {
    const authError = await verifyRequest(request)
    if (authError) return authError

    const body = (await request.json()) as SaveRequest
    if (!isValidContent(body.content)) {
      return NextResponse.json({ message: 'Invalid content payload.' }, { status: 400 })
    }

    let savedContent: SiteContent
    if (process.env.VERCEL) {
      savedContent = await saveProduction(body.content, body.images || [])
    } else {
      savedContent = await saveLocal(body.content, body.images || [])
    }

    return NextResponse.json({ message: 'Saved.', content: savedContent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return saveRequest(request)
}

export async function PUT(request: NextRequest) {
  return saveRequest(request)
}
