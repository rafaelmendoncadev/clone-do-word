import { describe, it, expect } from 'vitest'
import { importDocx, docxToProseMirror, exportDocx, proseMirrorToDocx } from '../import/import-docx'

describe('textAlign roundtrip', () => {
  it('preserva centralização em parágrafo comum', async () => {
    const pmDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'Centro' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Esquerda' }]
        }
      ]
    }
    const doc = proseMirrorToDocx(pmDoc, new Map())
    expect(doc.body[0]).toMatchObject({ type: 'paragraph', pPr: { align: 'center' } })
    const bytes = await exportDocx(doc)
    const imported = await importDocx(bytes)
    const out = docxToProseMirror(imported)
    const p0 = (out.content as Record<string, unknown>[])[0]
    expect((p0.attrs as Record<string, unknown>).textAlign).toBe('center')
  })

  it('preserva centralização em heading', async () => {
    const pmDoc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [{ type: 'text', text: 'Título' }]
        }
      ]
    }
    const doc = proseMirrorToDocx(pmDoc, new Map())
    expect(doc.body[0]).toMatchObject({ type: 'paragraph', pPr: { align: 'center' } })
    const bytes = await exportDocx(doc)
    const imported = await importDocx(bytes)
    const out = docxToProseMirror(imported)
    const p0 = (out.content as Record<string, unknown>[])[0]
    expect(p0.type).toBe('heading')
    expect((p0.attrs as Record<string, unknown>).textAlign).toBe('center')
  })

  it('preserva justify (both) e right', async () => {
    const pmDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [{ type: 'text', text: 'J' }]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [{ type: 'text', text: 'R' }]
        }
      ]
    }
    const bytes = await exportDocx(proseMirrorToDocx(pmDoc, new Map()))
    const out = docxToProseMirror(await importDocx(bytes))
    const content = out.content as Record<string, unknown>[]
    expect((content[0].attrs as Record<string, unknown>).textAlign).toBe('justify')
    expect((content[1].attrs as Record<string, unknown>).textAlign).toBe('right')
  })
})
