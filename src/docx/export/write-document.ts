import type { Block, Paragraph, ParagraphProps, Run, RunProps, TableBlock } from '../model/document-model'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function runPropsToXml(rPr: RunProps): string {
  const parts: string[] = []
  if (rPr.bold) parts.push('<w:b/>')
  if (rPr.italic) parts.push('<w:i/>')
  if (rPr.underline) parts.push('<w:u w:val="single"/>')
  if (rPr.strike) parts.push('<w:strike/>')
  if (rPr.fontFamily) parts.push(`<w:rFonts w:ascii="${escapeXml(rPr.fontFamily)}" w:hAnsi="${escapeXml(rPr.fontFamily)}"/>`)
  if (rPr.fontSize) {
    const halfPoints = Math.round(parseFloat(rPr.fontSize) * 2)
    parts.push(`<w:sz w:val="${halfPoints}"/>`)
    parts.push(`<w:szCs w:val="${halfPoints}"/>`)
  }
  if (rPr.color) parts.push(`<w:color w:val="${rPr.color.replace('#', '')}"/>`)
  if (rPr.highlight) parts.push(`<w:shd w:val="clear" w:fill="${rPr.highlight.replace('#', '')}"/>`)
  if (rPr.styleId) parts.push(`<w:rStyle w:val="${escapeXml(rPr.styleId)}"/>`)
  if (parts.length === 0) return ''
  return `<w:rPr>${parts.join('')}</w:rPr>`
}

function paragraphPropsToXml(pPr: ParagraphProps): string {
  const parts: string[] = []
  if (pPr.styleId) parts.push(`<w:pStyle w:val="${escapeXml(pPr.styleId)}"/>`)
  if (pPr.numId !== undefined) {
    parts.push(`<w:numPr><w:ilvl w:val="${pPr.ilvl || 0}"/><w:numId w:val="${pPr.numId}"/></w:numPr>`)
  }
  if (pPr.align) {
    const v = pPr.align === 'justify' ? 'both' : pPr.align
    parts.push(`<w:jc w:val="${v}"/>`)
  }
  const spacing: string[] = []
  if (pPr.spacingBefore !== undefined) spacing.push(`w:before="${pPr.spacingBefore}"`)
  if (pPr.spacingAfter !== undefined) spacing.push(`w:after="${pPr.spacingAfter}"`)
  if (pPr.lineSpacing !== undefined) spacing.push(`w:line="${pPr.lineSpacing}" w:lineRule="auto"`)
  if (spacing.length > 0) parts.push(`<w:spacing ${spacing.join(' ')}/>`)
  const ind: string[] = []
  if (pPr.indentLeft !== undefined) ind.push(`w:left="${pPr.indentLeft}"`)
  if (pPr.indentRight !== undefined) ind.push(`w:right="${pPr.indentRight}"`)
  if (pPr.indentFirstLine !== undefined) {
    if (pPr.indentFirstLine < 0) ind.push(`w:hanging="${-pPr.indentFirstLine}"`)
    else ind.push(`w:firstLine="${pPr.indentFirstLine}"`)
  }
  if (ind.length > 0) parts.push(`<w:ind ${ind.join(' ')}/>`)
  if (parts.length === 0) return ''
  return `<w:pPr>${parts.join('')}</w:pPr>`
}

function runsToXml(runs: Run[]): string {
  return runs
    .map((run) => {
      if (run.breakType === 'page') return '<w:r><w:br w:type="page"/></w:r>'
      if (run.field) return `<w:r><w:instrText xml:space="preserve">${escapeXml(run.field)}</w:instrText></w:r>`
      if (run.text === undefined) return ''
      return `<w:r>${runPropsToXml(run.rPr)}<w:t xml:space="preserve">${escapeXml(run.text)}</w:t></w:r>`
    })
    .join('')
}

function paragraphToXml(p: Paragraph): string {
  return `<w:p>${paragraphPropsToXml(p.pPr)}${runsToXml(p.runs)}</w:p>`
}

function tableToXml(tbl: TableBlock): string {
  const rows = tbl.rows
    .map((row) => {
      const cells = row.cells
        .map((cell) => {
          const tcPrParts: string[] = []
          if (cell.gridSpan && cell.gridSpan > 1) tcPrParts.push(`<w:gridSpan w:val="${cell.gridSpan}"/>`)
          if (cell.vMerge) tcPrParts.push(`<w:vMerge w:val="${cell.vMerge === 'restart' ? 'restart' : 'continue'}"/>`)
          if (cell.shd) tcPrParts.push(`<w:shd w:val="clear" w:fill="${cell.shd.replace('#', '')}"/>`)
          const tcPr = tcPrParts.length > 0 ? `<w:tcPr>${tcPrParts.join('')}</w:tcPr>` : ''
          const content = cell.blocks
            .map((b) => (b.type === 'paragraph' ? paragraphToXml(b) : ''))
            .join('')
          return `<w:tc>${tcPr}${content}</w:tc>`
        })
        .join('')
      return `<w:tr>${cells}</w:tr>`
    })
    .join('')
  return `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="000000"/><w:left w:val="single" w:sz="4" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:color="000000"/><w:right w:val="single" w:sz="4" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:color="000000"/></w:tblBorders></w:tblPr>${rows}</w:tbl>`
}

export function blockToXml(block: Block): string {
  switch (block.type) {
    case 'paragraph':
      return paragraphToXml(block)
    case 'table':
      return tableToXml(block)
    case 'pageBreak':
      return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
    case 'image':
      return '' // Imagens são tratadas via relacionamentos
    default:
      return ''
  }
}

export function buildDocumentXml(body: Block[]): string {
  const bodyXml = body.map(blockToXml).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${bodyXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body>
</w:document>`
}
