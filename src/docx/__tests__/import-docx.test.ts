import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { importDocx, docxToProseMirror, exportDocx, proseMirrorToDocx } from '../import/import-docx'
import { toUint8Array } from '../import/bytes'

const fixture = (name: string) => new Uint8Array(readFileSync(join(__dirname, 'fixtures', name)))

describe('importDocx', () => {
  it('imports a simple Word document', async () => {
    const doc = await importDocx(fixture('single-paragraph.docx'))
    expect(doc.body.length).toBeGreaterThan(0)
    const pm = docxToProseMirror(doc)
    expect(pm.type).toBe('doc')
    expect(Array.isArray(pm.content)).toBe(true)
    expect((pm.content as unknown[]).length).toBeGreaterThan(0)
  })

  it('imports a document with tables', async () => {
    const doc = await importDocx(fixture('tables.docx'))
    expect(doc.body.some((b) => b.type === 'table')).toBe(true)
    expect(docxToProseMirror(doc).type).toBe('doc')
  })

  it('roundtrips export after import', async () => {
    const doc = await importDocx(fixture('single-paragraph.docx'))
    const pm = docxToProseMirror(doc)
    const doc2 = proseMirrorToDocx(pm, doc.originalParts)
    const bytes = await exportDocx(doc2)
    expect(bytes.byteLength).toBeGreaterThan(0)
    const again = await importDocx(bytes)
    expect(again.body.length).toBeGreaterThan(0)
  })

  it('preserves multiple styled runs in a paragraph', () => {
    const doc = {
      meta: {},
      styles: {},
      numbering: [],
      body: [
        {
          type: 'paragraph' as const,
          pPr: {},
          runs: [
            { text: 'Plain text and ', rPr: {} },
            { text: 'bold text and ', rPr: { bold: true } },
            { text: 'italic text', rPr: { italic: true } }
          ]
        }
      ],
      originalParts: new Map()
    }
    const pm = docxToProseMirror(doc)
    const pNode = (pm.content as Array<{ type: string; content: Array<{ type: string; text: string; marks?: Array<{ type: string }> }> }>)[0]
    expect(pNode.content).toHaveLength(3)
    expect(pNode.content[0].marks).toBeUndefined()
    expect(pNode.content[1].marks).toEqual([{ type: 'bold' }])
    expect(pNode.content[2].marks).toEqual([{ type: 'italic' }])
  })

  it('converts TipTap lists to DocxDocument with numPr', () => {
    const pmDoc = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item 1' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item 2' }]
                }
              ]
            }
          ]
        }
      ]
    }
    const doc = proseMirrorToDocx(pmDoc, new Map())
    expect(doc.body).toHaveLength(2)
    expect(doc.body[0].type).toBe('paragraph')
    if (doc.body[0].type === 'paragraph') {
      expect(doc.body[0].pPr.numId).toBe(1)
      expect(doc.body[0].runs[0].text).toBe('Item 1')
    }
  })

  it('rejects invalid zip bytes', async () => {
    await expect(importDocx(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow()
  })
})

describe('toUint8Array', () => {
  it('accepts Uint8Array', () => {
    const u = new Uint8Array([1, 2, 3])
    expect(toUint8Array(u)).toBe(u)
  })

  it('accepts ArrayBuffer and plain object (IPC clone edge cases)', () => {
    expect(Array.from(toUint8Array(new Uint8Array([9, 8]).buffer))).toEqual([9, 8])
    expect(Array.from(toUint8Array({ 0: 80, 1: 75, 2: 3 }))).toEqual([80, 75, 3])
    expect(Array.from(toUint8Array([7, 6]))).toEqual([7, 6])
  })

  it('rejects garbage', () => {
    expect(() => toUint8Array(null)).toThrow()
    expect(() => toUint8Array('nope')).toThrow()
  })
})
