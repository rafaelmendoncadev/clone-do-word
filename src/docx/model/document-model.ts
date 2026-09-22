// DocumentModel intermediário — agnóstico de UI

export interface RunProps {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  fontFamily?: string
  fontSize?: string // e.g. "22" (half-points) ou "11pt"
  color?: string
  highlight?: string
  styleId?: string
}

export interface ParagraphProps {
  align?: 'left' | 'center' | 'right' | 'justify'
  styleId?: string
  numId?: number
  ilvl?: number
  spacingBefore?: number
  spacingAfter?: number
  lineSpacing?: number
  indentLeft?: number
  indentRight?: number
  indentFirstLine?: number
}

export interface Run {
  rPr: RunProps
  text?: string
  field?: string
  breakType?: 'page' | 'column' | 'textWrapping'
}

export interface Paragraph {
  type: 'paragraph'
  pPr: ParagraphProps
  runs: Run[]
}

export interface TableCell {
  blocks: Block[]
  gridSpan?: number
  vMerge?: 'restart' | 'continue'
  shd?: string
  width?: number
}

export interface TableRow {
  cells: TableCell[]
}

export interface TableBlock {
  type: 'table'
  rows: TableRow[]
  borders?: boolean
  width?: number
}

export interface ImageBlock {
  type: 'image'
  data: Uint8Array
  contentType: string
  width?: number
  height?: number
  name?: string
}

export interface PageBreakBlock {
  type: 'pageBreak'
}

export type Block = Paragraph | TableBlock | ImageBlock | PageBreakBlock

export interface StyleDef {
  styleId: string
  type: 'paragraph' | 'character'
  name: string
  basedOn?: string
  next?: string
  rPr?: RunProps
  pPr?: ParagraphProps
}

export interface NumberingLevel {
  ilvl: number
  format: string // 'decimal', 'lowerLetter', 'lowerRoman', 'bullet'
  text: string // '%1.', '%1.%2.' etc.
  indentLeft?: number
  hanging?: number
}

export interface NumberingDef {
  abstractNumId: number
  numId: number
  levels: NumberingLevel[]
}

export interface DocxDocument {
  meta: {
    title?: string
    author?: string
    created?: string
    modified?: string
  }
  styles: Record<string, StyleDef>
  numbering: NumberingDef[]
  body: Block[]
  // Pacote original para read-through
  originalParts: Map<string, Uint8Array>
}
