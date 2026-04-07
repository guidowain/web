export type Lang = 'en' | 'es'

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'en'

  const lang = navigator.language?.toLowerCase() || 'en'

  if (lang.startsWith('es')) return 'es'
  return 'en'
}