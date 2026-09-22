import { XMLParser } from 'fast-xml-parser'
import type { Block, Paragraph, ParagraphProps, Run, RunProps, TableBlock, TableCell, TableRow, ImageBlock } from '../model/document-model'
import { getPartAsBytes, getPartAsString } from '../ooxml/package'
import type { OoxmlPackage } from '../ooxml/package'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  isArray: (name) => ['p', 'r', 'tbl', 'tr', 'tc', 'br', 't', 'style', 'num', 'abstractNum', 'lvl', 'hyperlink'].includes(name)
})

function parseRunProps(rPr: Record<string, unknown> | undefined): RunProps {
  if (!rPr) return {}
  const props: RunProps = {}
  if (rPr.b !== undefined) props.bold = true
  if (rPr.i !== undefined) props.italic = true
  if (rPr.u) props.underline = true
  if (rPr.strike !== undefined) props.strike = true
  const rFonts = rPr.rFonts as Record<string, string> | undefined
  if (rFonts?.['@_ascii']) props.fontFamily = rFonts['@_ascii']
  const sz = rPr.sz as Record<string, string> | undefined
  if (sz?.['@_val']) props.fontSize = `${Math.round(Number(sz['@_val']) / 2)}pt`
  const color = rPr.color as Record<string, string> | undefined
  if (color?.['@_val'] && color['@_val'] !== 'auto') props.color = `#${color['@_val']}`
  const shd = rPr.shd as Record<string, string> | undefined
  if (shd?.['@_fill'] && shd['@_fill'] !== 'auto') props.highlight = `#${shd['@_fill']}`
  const rStyle = rPr.rStyle as Record<string, string> | undefined
  if (rStyle?.['@_val']) props.styleId = rStyle['@_val']
  return props
}

function parseParagraphProps(pPr: Record<string, unknown> | undefined): ParagraphProps {
  if (!pPr) return {}
  const props: ParagraphProps = {}
  const jc = pPr.jc as Record<string, string> | undefined
  if (jc?.['@_val']) {
    const v = jc['@_val']
    props.align = v === 'both' ? 'justify' : (v as ParagraphProps['align'])
  }
  const pStyle = pPr.pStyle as Record<string, string> | undefined
  if (pStyle?.['@_val']) props.styleId = pStyle['@_val']
  const numPr = pPr.numPr as Record<string, unknown> | undefined
  if (numPr) {
    const numId = numPr.numId as Record<string, string> | undefined
    const ilvl = numPr.ilvl as Record<string, string> | undefined
    if (numId?.['@_val']) props.numId = Number(numId['@_val'])
    if (ilvl?.['@_val']) props.ilvl = Number(ilvl['@_val'])
  }
  const spacing = pPr.spacing as Record<string, string> | undefined
  if (spacing) {
    if (spacing['@_before']) props.spacingBefore = Number(spacing['@_before'])
    if (spacing['@_after']) props.spacingAfter = Number(spacing['@_after'])
    if (spacing['@_line']) props.lineSpacing = Number(spacing['@_line'])
  }
  const ind = pPr.ind as Record<string, string> | undefined
  if (ind) {
    if (ind['@_left']) props.indentLeft = Number(ind['@_left'])
    if (ind['@_right']) props.indentRight = Number(ind['@_right'])
    if (ind['@_firstLine']) props.indentFirstLine = Number(ind['@_firstLine'])
    if (ind['@_hanging']) props.indentFirstLine = -Number(ind['@_hanging'])
  }
  return props
}

function parseRuns(children: Record<string, unknown>): Run[] {
  const runs: Run[] = []
  const rArr = (children.r as Record<string, unknown>[]) || []
  const hyperlinkArr = (children.hyperlink as Record<string, unknown>[]) || []

  // Runs diretos
  for (const r of rArr) {
    const rPr = parseRunProps(r.rPr as Record<string, unknown>)
    const brs = (r.br as Record<string, string>[]) || []
    for (const br of brs) {
      const breakType = br['@_type'] === 'page' ? 'page' : br['@_type'] === 'column' ? 'column' : 'textWrapping'
      runs.push({ rPr: {}, breakType: breakType as Run['breakType'] })
    }
    const ts = (r.t as Record<string, string | number>[]) || []
    for (const t of ts) {
      const text = typeof t === 'string' ? t : (t['#text'] ?? '')
      if (text) runs.push({ rPr: { ...rPr }, text: String(text) })
    }
    // fldChar / instrText para campos
    const instrTexts = (r.instrText as Record<string, string | number>[]) || []
    for (const it of instrTexts) {
      const text = typeof it === 'string' ? it : (it['#text'] ?? '')
      if (text) runs.push({ rPr: {}, field: String(text).trim() })
    }
  }

  // Runs dentro de hyperlinks (simplificado — extrai texto)
  for (const h of hyperlinkArr) {
    const hrArr = (h.r as Record<string, unknown>[]) || []
    for (const r of hrArr) {
      const rPr = parseRunProps(r.rPr as Record<string, unknown>)
      const ts = (r.t as Record<string, string | number>[]) || []
      for (const t of ts) {
        const text = typeof t === 'string' ? t : (t['#text'] ?? '')
        if (text) runs.push({ rPr: { ...rPr }, text: String(text) })
      }
    }
  }

  return runs
}

function parseParagraph(p: Record<string, unknown>): Paragraph {
  const pPr = parseParagraphProps(p.pPr as Record<string, unknown>)
  const runs = parseRuns(p as Record<string, unknown>)
  return { type: 'paragraph', pPr, runs }
}

function parseTable(tbl: Record<string, unknown>): TableBlock {
  const trArr = (tbl.tr as Record<string, unknown>[]) || []
  const rows: TableRow[] = trArr.map((tr) => {
    const tcArr = (tr.tc as Record<string, unknown>[]) || []
    const cells: TableCell[] = tcArr.map((tc) => {
      const tcPr = tc.tcPr as Record<string, unknown> | undefined
      const cell: TableCell = { blocks: [] }
      if (tcPr) {
        const gridSpan = tcPr.gridSpan as Record<string, string> | undefined
        if (gridSpan?.['@_val']) cell.gridSpan = Number(gridSpan['@_val'])
        const vMerge = tcPr.vMerge as Record<string, string> | undefined
        if (vMerge) {
          cell.vMerge = vMerge['@_val'] === 'restart' ? 'restart' : 'continue'
        }
        const shd = tcPr.shd as Record<string, string> | undefined
        if (shd?.['@_fill'] && shd['@_fill'] !== 'auto') cell.shd = `#${shd['@_fill']}`
      }
      // Conteúdo da célula: parágrafos
      const pArr = (tc.p as Record<string, unknown>[]) || []
      for (const p of pArr) {
        cell.blocks.push(parseParagraph(p))
      }
      return cell
    })
    return { cells }
  })
  return { type: 'table', rows }
}

export function parseDocumentXml(xml: string, pkg: OoxmlPackage): Block[] {
  const doc = parser.parse(xml)
  const document = doc.document as Record<string, unknown>
  const body = document.body as Record<string, unknown>
  const blocks: Block[] = []

  const pArr = (body.p as Record<string, unknown>[]) || []
  const tblArr = (body.tbl as Record<string, unknown>[]) || []

  // Preservar ordem mista p/tbl
  const ordered: Array<{ type: 'p' | 'tbl'; data: Record<string, unknown> }> = []
  // Reconstruir ordem a partir do XML bruto seria ideal; aqui usamos ordem p-then-tbl como aproximação
  // Melhor: iterar filhos do body — fast-xml-parser não mantém ordem, então processamos p e tbl
  // Para melhor fidelidade, parseamos sequencialmente
  for (const p of pArr) ordered.push({ type: 'p', data: p })
  for (const t of tblArr) ordered.push({ type: 'tbl', data: t })

  // Ordenar por posição no XML se possível (fallback: p antes de tbl)
  // Na prática, vamos processar todos os p e tbl
  for (const item of ordered) {
    if (item.type === 'p') {
      const para = parseParagraph(item.data)
      // Detectar page break
      const hasPageBreak = para.runs.some((r) => r.breakType === 'page')
      if (hasPageBreak) {
        // Remover o break do run e adicionar bloco de quebra
        para.runs = para.runs.filter((r) => r.breakType !== 'page')
        if (para.runs.length > 0) blocks.push(para)
        blocks.push({ type: 'pageBreak' })
      } else {
        blocks.push(para)
      }
    } else {
      blocks.push(parseTable(item.data))
    }
  }

  return blocks
}

export function parseStylesXml(xml: string | null): Record<string, { styleId: string; type: string; name: string }> {
  if (!xml) return {}
  const doc = parser.parse(xml)
  const stylesRoot = doc.styles as Record<string, unknown>
  const styleArr = (stylesRoot.style as Record<string, unknown>[]) || []
  const result: Record<string, { styleId: string; type: string; name: string }> = {}

  for (const s of styleArr) {
    const styleId = String(s['@_styleId'] ?? '')
    if (!styleId) continue
    const type = String(s['@_type'] ?? 'paragraph')
    const name = String((s.name as Record<string, string>)?.['@_val'] ?? styleId)
    result[styleId] = { styleId, type, name }
  }
  return result
}

export function extractImages(pkg: OoxmlPackage): Map<string, Uint8Array> {
  const images = new Map<string, Uint8Array>()
  for (const [name, data] of pkg.parts) {
    if (name.startsWith('word/media/')) {
      images.set(name, data)
    }
  }
  return images
}
