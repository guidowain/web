import type { Lang } from './getLang'

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
}> = {
  en: {
    navContact: 'Contact',
    heroSub: 'Retoucher & AI Artist',
    heroDesc: 'Buenos Aires · 12+ years turning good shots into scroll-stoppers for fashion, beauty & lifestyle.',
    aboutLine1: 'PIXEL PERFECT.',
    aboutLine2: 'EVERY TIME.',
    aboutBody1:
      "I'm Guido Wain — a Buenos Aires-based photo retoucher and AI artist with 12+ years turning good shots into scroll-stoppers.",
    aboutBody2:
      'Whether you need a full campaign polished, one hero shot rescued, or AI-generated visuals — I deliver production-ready files that make art directors relax and products pop.',
    contactLine1: "LET'S",
    contactLine2: 'WORK',
    contactLine3: 'TOGETHER.',
    footerLocation: 'Buenos Aires, Argentina',
    marquee: [
      'Skin Cleanup',
      'Colour Grading',
      'Product Packshot',
      'BG Removal',
      'Creative Compositing',
      'Image Restoration',
      'RAW Processing',
      'AI Generation',
    ],
  },
  es: {
    navContact: 'Contacto',
    heroSub: 'Retocador & Artista AI',
    heroDesc: 'Buenos Aires · +12 años transformando buenas fotos en imágenes que frenan el scroll para moda, belleza y lifestyle.',
    aboutLine1: 'PIXEL PERFECT.',
    aboutLine2: 'EVERY TIME.',
    aboutBody1:
      'Soy Guido Wain, retocador fotográfico y artista AI de Buenos Aires, con más de 12 años transformando buenas fotos en imágenes que frenan el scroll.',
    aboutBody2:
      'Ya sea una campaña entera, una imagen clave que haya que rescatar o visuales generados con AI, entrego archivos listos para producción que hacen que el trabajo fluya y que el producto destaque.',
    contactLine1: 'TRABAJEMOS',
    contactLine2: 'JUNTOS.',
    contactLine3: '',
    footerLocation: 'Buenos Aires, Argentina',
    marquee: [
      'Limpieza de piel',
      'Color grading',
      'Packshot de producto',
      'Recorte de fondo',
      'Composición',
      'Restauración',
      'Procesado RAW',
      'Generación con AI',
    ],
  },
}