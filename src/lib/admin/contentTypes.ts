import type { Lang } from '@/lib/getLang'

export type TranslationCopy = {
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
}

export type Slide = {
  img: string
  client: string
}

export type LocalizedString = Record<Lang, string>

export type CvEntry = {
  id: string
  title: LocalizedString
  organization: LocalizedString
  period: LocalizedString
  description: LocalizedString
}

export type CvSkillGroup = {
  id: string
  title: LocalizedString
  items: LocalizedString[]
}

export type CvTextItem = {
  id: string
  text: LocalizedString
}

export type CvContent = {
  profile: {
    name: string
    title: LocalizedString
    summary: LocalizedString
    location: string
    phone: string
    email: string
    website: string
  }
  experience: CvEntry[]
  skills: CvSkillGroup[]
  education: CvEntry[]
  languages: CvTextItem[]
  volunteering: CvTextItem[]
}

export type SiteContent = {
  translations: Record<Lang, TranslationCopy>
  contact: {
    email: string
    phoneLabel: string
    whatsappUrl: string
    linkedinUrl: string
    instagramUrl: string
  }
  slides: Slide[]
  cv: CvContent
}

export type PendingImage = {
  path: string
  dataUrl: string
}
