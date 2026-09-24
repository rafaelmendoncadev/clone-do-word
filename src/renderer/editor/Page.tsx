import type { ReactNode } from 'react'
import { mmToPx } from './page-setup'

interface PageProps {
  pageNumber: number
  totalPages: number
  setup: { widthPx: number; heightPx: number }
  margins: { top: number; right: number; bottom: number; left: number }
  header?: string
  footer?: string
  zoom: number
  children: ReactNode
}

function resolveTokens(template: string, pageNumber: number, totalPages: number): string {
  return template
    .replace(/\{PAGE\}/g, String(pageNumber))
    .replace(/\{NUMPAGES\}/g, String(totalPages))
    .replace(/\{DATE\}/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/\{TIME\}/g, new Date().toLocaleTimeString('pt-BR'))
}

/**
 * Folha com altura mínima A4 (ou o tamanho escolhido) que **cresce com o conteúdo**,
 * para o papel branco acompanhar o documento até o fim.
 */
export function Page({
  pageNumber,
  totalPages,
  setup,
  margins,
  header,
  footer,
  zoom,
  children
}: PageProps) {
  const scale = zoom / 100
  const pageW = setup.widthPx * scale
  const pageH = setup.heightPx * scale
  const pad = {
    top: mmToPx(margins.top) * scale,
    right: mmToPx(margins.right) * scale,
    bottom: mmToPx(margins.bottom) * scale,
    left: mmToPx(margins.left) * scale
  }

  return (
    <div
      className="relative mx-auto mb-6 flex flex-col bg-white shadow-md print:mb-0 print:shadow-none"
      style={{ width: pageW, minHeight: pageH }}
    >
      {/* Guia de margens */}
      <div
        className="pointer-events-none absolute border border-dashed border-neutral-200 print:hidden"
        style={{ top: pad.top, right: pad.right, bottom: pad.bottom, left: pad.left }}
      />
      <div
        className="flex min-h-full flex-1 flex-col"
        style={{
          paddingTop: pad.top,
          paddingRight: pad.right,
          paddingBottom: pad.bottom,
          paddingLeft: pad.left
        }}
      >
        {header && (
          <div className="mb-2 text-xs text-neutral-500 print:hidden">
            {resolveTokens(header, pageNumber, totalPages)}
          </div>
        )}
        <div className="flex-1 select-text cursor-text">{children}</div>
        {footer && (
          <div className="mt-4 text-center text-xs text-neutral-500 print:hidden">
            {resolveTokens(footer, pageNumber, totalPages)}
          </div>
        )}
      </div>
    </div>
  )
}
