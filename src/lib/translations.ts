import type { Lang } from './getLang'
import siteContent from '@/content/site.json'

export const translations: Record<Lang, {
  navContact: string
  heroSub: string
  heroDesc: string
  aboutLine1: string
  aboutLine2: string
  aboutBody1: string
  aboutBody2: string
  contactLine1: string
  contactLine2: string
  contactLine3: string
  footerLocation: string
  marquee: string[]
}> = siteContent.translations
