export const APP_NAME = 'Clone do Word'

export const PAGE_SIZES = {
  a4: { width: 210, height: 297, label: 'A4' },
  letter: { width: 215.9, height: 279.4, label: 'Carta' },
  legal: { width: 215.9, height: 355.6, label: 'Ofício' }
} as const

export type PageSizeId = keyof typeof PAGE_SIZES

export const DEFAULT_PAGE_SETUP = {
  size: 'a4' as PageSizeId,
  orientation: 'portrait' as 'portrait' | 'landscape',
  margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 }
}
