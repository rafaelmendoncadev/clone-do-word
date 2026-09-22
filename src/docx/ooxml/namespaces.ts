export const NS = {
  W: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  R: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  WP: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
  A: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  PIC: 'http://schemas.openxmlformats.org/drawingml/2006/picture',
  RELS: 'http://schemas.openxmlformats.org/package/2006/relationships',
  CT: 'http://schemas.openxmlformats.org/package/2006/content-types',
  CP: 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
  DC: 'http://purl.org/dc/elements/1.1/',
  DCTERMS: 'http://purl.org/dc/terms/'
}

export function w(tag: string): string {
  return `w:${tag}`
}

export function attr(name: string): string {
  return `w:${name}`
}
