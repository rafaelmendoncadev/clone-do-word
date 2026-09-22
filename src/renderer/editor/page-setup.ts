import type { PageSizeId } from '@shared/constants'
import { PAGE_SIZES } from '@shared/constants'

export interface PageSetup {
  size: PageSizeId
  orientation: 'portrait' | 'landscape'
  margins: { top: number; right: number; bottom: number; left: number }
}

export interface HeaderFooterConfig {
  header: string
  footer: string
  differentFirstPage: boolean
  evenAndOdd: boolean
  firstPageHeader: string
  firstPageFooter: string
  evenHeader: string
  evenFooter: string
}

export const DEFAULT_HEADER_FOOTER: HeaderFooterConfig = {
  header: '',
  footer: 'Página {PAGE} de {NUMPAGES}',
  differentFirstPage: false,
  evenAndOdd: false,
  firstPageHeader: '',
  firstPageFooter: '',
  evenHeader: '',
  evenFooter: ''
}

export function mmToPx(mm: number): number {
  return (mm / 25.4) * 96
}

export function getPageDimensions(setup: PageSetup) {
  const size = PAGE_SIZES[setup.size]
  const w = setup.orientation === 'landscape' ? size.height : size.width
  const h = setup.orientation === 'landscape' ? size.width : size.height
  return {
    widthPx: mmToPx(w),
    heightPx: mmToPx(h),
    widthMm: w,
    heightMm: h
  }
}

export function resolveTokens(template: string, pageNumber: number, totalPages: number): string {
  return template
    .replace(/\{PAGE\}/g, String(pageNumber))
    .replace(/\{NUMPAGES\}/g, String(totalPages))
    .replace(/\{DATE\}/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/\{TIME\}/g, new Date().toLocaleTimeString('pt-BR'))
}
