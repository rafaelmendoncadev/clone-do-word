import type { DocxDocument, Block, Run, ParagraphProps, RunProps } from '../model/document-model'
import { getPartAsString, readPackage, writePackage, setPartFromString } from '../ooxml/package'
import { parseDocumentXml, parseStylesXml } from './parse-document'
import { buildDocumentXml } from '../export/write-document'

export async function importDocx(bytes: Uint8Array): Promise<DocxDocument> {
  const pkg = await readPackage(bytes)
  const documentXml = getPartAsString(pkg.parts, 'word/document.xml')
  if (!documentXml) throw new Error('Arquivo .docx inválido: word/document.xml não encontrado')

  const body = parseDocumentXml(documentXml, pkg)
  const stylesXml = getPartAsString(pkg.parts, 'word/styles.xml')
  const styles = parseStylesXml(stylesXml)

  // Extrair metadados
  const coreXml = getPartAsString(pkg.parts, 'docProps/core.xml')
  const meta: DocxDocument['meta'] = {}
  if (coreXml) {
    const titleMatch = coreXml.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/)
    const creatorMatch = coreXml.match(/<dc:creator[^>]*>([^<]*)<\/dc:creator>/)
    if (titleMatch) meta.title = titleMatch[1]
    if (creatorMatch) meta.author = creatorMatch[1]
  }

  return {
    meta,
    styles: styles as DocxDocument['styles'],
    numbering: [],
    body,
    originalParts: pkg.parts
  }
}

export async function exportDocx(doc: DocxDocument): Promise<Uint8Array> {
  // Começar do package original (read-through) ou criar novo
  const parts = new Map(doc.originalParts)

  // Reescrever document.xml
  const documentXml = buildDocumentXml(doc.body)
  setPartFromString(parts, 'word/document.xml', documentXml)

  // Garantir content types e relationships mínimos
  if (!parts.has('[Content_Types].xml')) {
    setPartFromString(
      parts,
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
    )
  }

  if (!parts.has('_rels/.rels')) {
    setPartFromString(
      parts,
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    )
  }

  if (!parts.has('word/_rels/document.xml.rels')) {
    setPartFromString(
      parts,
      'word/_rels/document.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
    )
  }

  if (!parts.has('word/styles.xml')) {
    setPartFromString(
      parts,
      'word/styles.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults>
<w:rPrDefault>
<w:rPr>
<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
<w:sz w:val="22"/>
<w:szCs w:val="22"/>
<w:lang w:val="pt-BR"/>
</w:rPr>
</w:rPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
<w:name w:val="Normal"/>
<w:qFormat/>
</w:style>
<w:style w:type="paragraph" w:styleId="Heading1">
<w:name w:val="heading 1"/>
<w:basedOn w:val="Normal"/>
<w:next w:val="Normal"/>
<w:qFormat/>
<w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/><w:color w:val="2E74B5"/></w:rPr>
</w:style>
<w:style w:type="paragraph" w:styleId="Heading2">
<w:name w:val="heading 2"/>
<w:basedOn w:val="Normal"/>
<w:next w:val="Normal"/>
<w:qFormat/>
<w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/><w:color w:val="2E74B5"/></w:rPr>
</w:style>
<w:style w:type="paragraph" w:styleId="Heading3">
<w:name w:val="heading 3"/>
<w:basedOn w:val="Normal"/>
<w:next w:val="Normal"/>
<w:qFormat/>
<w:pPr><w:spacing w:before="160" w:after="60"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="1F4D78"/></w:rPr>
</w:style>
</w:styles>`
    )
  }

  return writePackage(parts)
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function runPropToMarks(rPr?: RunProps): Record<string, unknown>[] {
  if (!rPr) return []
  const marks: Record<string, unknown>[] = []
  if (rPr.bold) marks.push({ type: 'bold' })
  if (rPr.italic) marks.push({ type: 'italic' })
  if (rPr.underline) marks.push({ type: 'underline' })
  if (rPr.strike) marks.push({ type: 'strike' })
  if (rPr.fontFamily || rPr.fontSize || rPr.color) {
    const style: Record<string, string> = {}
    if (rPr.fontFamily) style.fontFamily = rPr.fontFamily
    if (rPr.fontSize) style.fontSize = rPr.fontSize
    if (rPr.color) style.color = rPr.color
    marks.push({ type: 'textStyle', attrs: style })
  }
  if (rPr.highlight) {
    marks.push({ type: 'highlight', attrs: { color: rPr.highlight } })
  }
  return marks
}

function runsToPmContent(runs: Run[]): Record<string, unknown>[] {
  const content: Record<string, unknown>[] = []
  for (const r of runs) {
    if (r.text) {
      const marks = runPropToMarks(r.rPr)
      content.push({
        type: 'text',
        text: r.text,
        ...(marks.length > 0 ? { marks } : {})
      })
    }
  }
  return content
}

// Mapear DocxDocument ↔ ProseMirror JSON
export function docxToProseMirror(doc: DocxDocument): Record<string, unknown> {
  const content: Record<string, unknown>[] = []
  let currentList: { type: 'bulletList' | 'orderedList'; items: Record<string, unknown>[] } | null = null

  const flushList = () => {
    if (currentList) {
      content.push({
        type: currentList.type,
        content: currentList.items
      })
      currentList = null
    }
  }

  for (const block of doc.body) {
    if (block.type === 'paragraph' && block.pPr.numId !== undefined) {
      const isBullet = block.pPr.numId === 1
      const listType = isBullet ? 'bulletList' : 'orderedList'
      if (!currentList || currentList.type !== listType) {
        flushList()
        currentList = { type: listType, items: [] }
      }
      const pNode = blockToPmNode(block)
      currentList.items.push({
        type: 'listItem',
        content: [pNode]
      })
      continue
    }

    flushList()
    content.push(blockToPmNode(block))
  }

  flushList()

  return { type: 'doc', content: content.length > 0 ? content : [{ type: 'paragraph' }] }
}

function blockToPmNode(block: Block): Record<string, unknown> {
  switch (block.type) {
    case 'paragraph': {
      const content = runsToPmContent(block.runs)
      const attrs: Record<string, unknown> = {}
      if (block.pPr.align) attrs.textAlign = block.pPr.align

      if (block.pPr.styleId?.startsWith('Heading') || block.pPr.styleId?.startsWith('heading')) {
        const level = parseInt(block.pPr.styleId.replace(/[^0-9]/g, ''), 10) || 1
        return {
          type: 'heading',
          attrs: { level, ...(attrs.textAlign ? { textAlign: attrs.textAlign } : {}) },
          content: content.length > 0 ? content : undefined
        }
      }

      return {
        type: 'paragraph',
        attrs,
        content: content.length > 0 ? content : undefined
      }
    }
    case 'table':
      return {
        type: 'table',
        content: block.rows.map((row) => ({
          type: 'tableRow',
          content: row.cells.map((cell) => ({
            type: 'tableCell',
            content: cell.blocks.map(blockToPmNode)
          }))
        }))
      }
    case 'pageBreak':
      return { type: 'horizontalRule' }
    case 'image':
      return {
        type: 'image',
        attrs: {
          src: `data:${block.contentType};base64,${bytesToBase64(block.data)}`,
          width: block.width,
          height: block.height
        }
      }
    default:
      return { type: 'paragraph' }
  }
}

// Converter ProseMirror JSON → DocxDocument
export function proseMirrorToDocx(pmDoc: Record<string, unknown>, originalParts: Map<string, Uint8Array>): DocxDocument {
  const content = (pmDoc.content as Record<string, unknown>[] || [])
  const body: Block[] = []
  for (const node of content) {
    body.push(...pmNodeToBlocks(node))
  }
  return {
    meta: {},
    styles: {},
    numbering: [],
    body,
    originalParts
  }
}

function pmMarksToRunProps(marks: Record<string, unknown>[]): Run['rPr'] {
  const rPr: Run['rPr'] = {}
  for (const m of marks) {
    if (m.type === 'bold') rPr.bold = true
    if (m.type === 'italic') rPr.italic = true
    if (m.type === 'underline') rPr.underline = true
    if (m.type === 'strike') rPr.strike = true
    if (m.type === 'textStyle') {
      const a = (m.attrs || {}) as Record<string, string>
      if (a.fontFamily) rPr.fontFamily = a.fontFamily
      if (a.fontSize) rPr.fontSize = a.fontSize
      if (a.color) rPr.color = a.color
    }
    if (m.type === 'highlight') {
      const a = (m.attrs || {}) as Record<string, string>
      if (a.color) rPr.highlight = a.color
    }
  }
  return rPr
}

function pmContentToRuns(content: Record<string, unknown>[]): Run[] {
  return content.map((child) => ({
    rPr: pmMarksToRunProps((child.marks as Record<string, unknown>[] || [])),
    text: (child.text as string) || ''
  }))
}

function pmNodeToBlocks(node: Record<string, unknown>): Block[] {
  switch (node.type) {
    case 'paragraph': {
      const attrs = (node.attrs || {}) as Record<string, unknown>
      const content = (node.content as Record<string, unknown>[] || [])
      const runs = pmContentToRuns(content)
      const pPr: ParagraphProps = {}
      if (attrs.textAlign) pPr.align = attrs.textAlign as ParagraphProps['align']
      if (attrs.styleId) pPr.styleId = attrs.styleId as string
      return [{ type: 'paragraph', pPr, runs }]
    }
    case 'heading': {
      const attrs = (node.attrs || {}) as Record<string, unknown>
      const level = (attrs.level as number) || 1
      const content = (node.content as Record<string, unknown>[] || [])
      const runs = pmContentToRuns(content)
      const pPr: ParagraphProps = { styleId: `Heading${level}` }
      if (attrs.textAlign) pPr.align = attrs.textAlign as ParagraphProps['align']
      return [{ type: 'paragraph', pPr, runs }]
    }
    case 'bulletList':
    case 'orderedList': {
      const isBullet = node.type === 'bulletList'
      const items = (node.content as Record<string, unknown>[] || [])
      const blocks: Block[] = []
      for (const item of items) {
        const itemContent = (item.content as Record<string, unknown>[] || [])
        for (const child of itemContent) {
          const childBlocks = pmNodeToBlocks(child)
          for (const b of childBlocks) {
            if (b.type === 'paragraph') {
              b.pPr.numId = isBullet ? 1 : 2
              b.pPr.ilvl = 0
            }
            blocks.push(b)
          }
        }
      }
      return blocks
    }
    case 'table': {
      const rows = (node.content as Record<string, unknown>[] || []).map((rowNode) => ({
        cells: (rowNode.content as Record<string, unknown>[] || []).map((cellNode) => ({
          blocks: (cellNode.content as Record<string, unknown>[] || []).flatMap(pmNodeToBlocks)
        }))
      }))
      return [{ type: 'table', rows }]
    }
    case 'horizontalRule':
      return [{ type: 'pageBreak' }]
    case 'image': {
      const attrs = (node.attrs || {}) as Record<string, unknown>
      const src = String(attrs.src || '')
      let contentType = 'image/png'
      let data = new Uint8Array()
      if (src.startsWith('data:')) {
        const [header, b64] = src.split(';base64,')
        contentType = header.replace('data:', '')
        if (b64) {
          try {
            const bin = atob(b64)
            data = new Uint8Array(bin.length)
            for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i)
          } catch {
            // fallback
          }
        }
      }
      return [{
        type: 'image',
        data,
        contentType,
        width: typeof attrs.width === 'number' ? attrs.width : 400,
        height: typeof attrs.height === 'number' ? attrs.height : 300
      }]
    }
    default:
      return [{ type: 'paragraph', pPr: {}, runs: [] }]
  }
}
