import type { DocxDocument, Block, Run, ParagraphProps } from '../model/document-model'
import type { OoxmlPackage } from '../ooxml/package'
import { getPartAsString, readPackage, writePackage, setPartFromString } from '../ooxml/package'
import { parseDocumentXml, parseStylesXml, extractImages } from './parse-document'
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

// Mapear DocxDocument ↔ ProseMirror JSON (simplificado)
export function docxToProseMirror(doc: DocxDocument): Record<string, unknown> {
  const content: Record<string, unknown>[] = []

  for (const block of doc.body) {
    content.push(blockToPmNode(block))
  }

  return { type: 'doc', content: content.length > 0 ? content : [{ type: 'paragraph' }] }
}

function blockToPmNode(block: Block): Record<string, unknown> {
  switch (block.type) {
    case 'paragraph': {
      const marks = runsToMarks(block.runs)
      const text = block.runs.map((r) => r.text || '').join('')
      const attrs: Record<string, unknown> = {}
      if (block.pPr.align) attrs.textAlign = block.pPr.align

      if (block.pPr.styleId?.startsWith('Heading') || block.pPr.styleId?.startsWith('heading')) {
        const level = parseInt(block.pPr.styleId.replace(/[^0-9]/g, ''), 10) || 1
        return {
          type: 'heading',
          attrs: { level, ...(attrs.textAlign ? { textAlign: attrs.textAlign } : {}) },
          content: text ? [{ type: 'text', text, marks }] : undefined
        }
      }

      return {
        type: 'paragraph',
        attrs,
        content: text ? [{ type: 'text', text, marks }] : undefined
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

function runsToMarks(runs: Run[]): Record<string, unknown>[] {
  const first = runs[0]
  if (!first?.rPr) return []
  const marks: Record<string, unknown>[] = []
  const { rPr } = first
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
  return marks
}

// Converter ProseMirror JSON → DocxDocument
export function proseMirrorToDocx(pmDoc: Record<string, unknown>, originalParts: Map<string, Uint8Array>): DocxDocument {
  const body = (pmDoc.content as Record<string, unknown>[] || []).map(pmNodeToBlock)
  return {
    meta: {},
    styles: {},
    numbering: [],
    body,
    originalParts
  }
}

function pmNodeToBlock(node: Record<string, unknown>): Block {
  switch (node.type) {
    case 'paragraph': {
      const attrs = (node.attrs || {}) as Record<string, unknown>
      const content = (node.content as Record<string, unknown>[] || [])
      const runs: Run[] = content.map((child) => {
        const marks = (child.marks as Record<string, unknown>[] || [])
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
        }
        return { rPr, text: (child.text as string) || '' }
      })
      const pPr: ParagraphProps = {}
      if (attrs.textAlign) pPr.align = attrs.textAlign as ParagraphProps['align']
      if (attrs.styleId) pPr.styleId = attrs.styleId as string
      return { type: 'paragraph', pPr, runs }
    }
    case 'heading': {
      const attrs = (node.attrs || {}) as Record<string, unknown>
      const level = (attrs.level as number) || 1
      const content = (node.content as Record<string, unknown>[] || [])
      const runs: Run[] = content.map((child) => ({
        rPr: {},
        text: (child.text as string) || ''
      }))
      return {
        type: 'paragraph',
        pPr: { styleId: `Heading${level}` },
        runs
      }
    }
    case 'table': {
      const rows = (node.content as Record<string, unknown>[] || []).map((rowNode) => ({
        cells: (rowNode.content as Record<string, unknown>[] || []).map((cellNode) => ({
          blocks: (cellNode.content as Record<string, unknown>[] || []).map(pmNodeToBlock)
        }))
      }))
      return { type: 'table', rows }
    }
    case 'horizontalRule':
      return { type: 'pageBreak' }
    default:
      return { type: 'paragraph', pPr: {}, runs: [] }
  }
}
