import { promises as fs } from 'fs'
import path from 'path'
import siteContent from '@/content/site.json'
import { getFileFromGithub } from '@/lib/admin/githubContent'
import type { SiteContent } from '@/lib/admin/contentTypes'

const siteContentPath = 'src/content/site.json'

function normalizeSiteContent(content: SiteContent) {
  const fallbackSummary = {
    en: [content.cv?.experience?.[0]?.description?.en, content.cv?.experience?.[1]?.description?.en]
      .filter(Boolean)
      .join(' '),
    es: [content.cv?.experience?.[0]?.description?.es, content.cv?.experience?.[1]?.description?.es]
      .filter(Boolean)
      .join(' '),
  }

  return {
    ...content,
    cv: {
      ...content.cv,
      profile: {
        ...content.cv.profile,
        summary: content.cv.profile.summary ?? fallbackSummary,
      },
    },
  }
}

function parseSiteContent(value: string) {
  return normalizeSiteContent(JSON.parse(value) as SiteContent)
}

export async function loadSiteContent() {
  if (process.env.VERCEL) {
    try {
      return parseSiteContent((await getFileFromGithub(siteContentPath)).toString('utf8'))
    } catch (error) {
      console.error('GitHub content read error:', error)
      return normalizeSiteContent(siteContent as SiteContent)
    }
  }

  try {
    const content = await fs.readFile(path.join(process.cwd(), siteContentPath), 'utf8')
    return parseSiteContent(content)
  } catch {
    return normalizeSiteContent(siteContent as SiteContent)
  }
}
