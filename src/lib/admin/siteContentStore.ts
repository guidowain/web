import { promises as fs } from 'fs'
import path from 'path'
import siteContent from '@/content/site.json'
import { getFileFromGithub } from '@/lib/admin/githubContent'
import type { SiteContent } from '@/lib/admin/contentTypes'

const siteContentPath = 'src/content/site.json'

function parseSiteContent(value: string) {
  return JSON.parse(value) as SiteContent
}

export async function loadSiteContent() {
  if (process.env.VERCEL) {
    try {
      return parseSiteContent((await getFileFromGithub(siteContentPath)).toString('utf8'))
    } catch (error) {
      console.error('GitHub content read error:', error)
      return siteContent as SiteContent
    }
  }

  try {
    const content = await fs.readFile(path.join(process.cwd(), siteContentPath), 'utf8')
    return parseSiteContent(content)
  } catch {
    return siteContent as SiteContent
  }
}
