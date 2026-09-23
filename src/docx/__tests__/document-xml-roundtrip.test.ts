import { describe, it, expect } from 'vitest'
import { importDocx, docxToProseMirror, exportDocx, proseMirrorToDocx } from '../import/import-docx'
import { buildDocumentXml } from '../export/write-document'
import { parseDocumentXml } from '../import/parse-document'

describe('document.xml roundtrip edge cases', () => {
  it('preserves accented and special characters', async () => {
    const pmDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Ação, coração, "aspas", <tags>, & ampersand, ção 100%'
            }
          ]
        }
      ]
    }
    const doc = proseMirrorToDocx(pmDoc, new Map())
    const bytes = await exportDocx(doc)
    const reopened = await importDocx(bytes)
    const pm = docxToProseMirror(reopened) as {
      content: Array<{ content?: Array<{ text?: string }> }>
    }
    expect(pm.content[0].content?.[0].text).toBe(
      'Ação, coração, "aspas", <tags>, & ampersand, ção 100%'
    )
  })

  it('preserves empty paragraphs between text', async () => {
    const pmDoc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Primeiro' }] },
        { type: 'paragraph' },
        { type: 'paragraph', content: [{ type: 'text', text: 'Terceiro' }] }
      ]
    }
    const doc = proseMirrorToDocx(pmDoc, new Map())
    const xml = buildDocumentXml(doc.body)
    const parsed = parseDocumentXml(xml)
    expect(parsed.length).toBe(3)
    const bytes = await exportDocx(doc)
    const reopened = await importDocx(bytes)
    const pm = docxToProseMirror(reopened) as {
      content: Array<{ type: string; content?: Array<{ text?: string }> }>
    }
    expect(pm.content).toHaveLength(3)
    expect(pm.content[0].content?.[0].text).toBe('Primeiro')
    expect(pm.content[2].content?.[0].text).toBe('Terceiro')
  })

  it('preserves numeric-looking text without coercing (10.00, 007, 0)', async () => {
    const pmDoc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'valores: 10.00, 007 e 0' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '0' }] }
      ]
    }
    const doc = proseMirrorToDocx(pmDoc, new Map())
    const bytes = await exportDocx(doc)
    const reopened = await importDocx(bytes)
    const pm = docxToProseMirror(reopened) as {
      content: Array<{ content?: Array<{ text?: string }> }>
    }
    expect(pm.content[0].content?.[0].text).toBe('valores: 10.00, 007 e 0')
    expect(pm.content[1].content?.[0].text).toBe('0')
  })

  it('preserves trailing spaces at run boundaries', async () => {
    const pmDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'plain ' },
            { type: 'text', text: 'bold ', marks: [{ type: 'bold' }] },
            { type: 'text', text: 'italic' }
          ]
        }
      ]
    }
    const doc = proseMirrorToDocx(pmDoc, new Map())
    const bytes = await exportDocx(doc)
    const reopened = await importDocx(bytes)
    const pm = docxToProseMirror(reopened) as {
      content: Array<{ content?: Array<{ text?: string }> }>
    }
    const texts = pm.content[0].content?.map((c) => c.text) ?? []
    expect(texts).toEqual(['plain ', 'bold ', 'italic'])
    expect(texts.join('')).toBe('plain bold italic')
  })

  it('overwrites document.xml from originalParts (does not keep stale body)', async () => {
    // Build a package with "OLD CONTENT"
    const oldPm = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'OLD CONTENT' }] }
      ]
    }
    const oldDoc = proseMirrorToDocx(oldPm, new Map())
    const oldBytes = await exportDocx(oldDoc)
    const imported = await importDocx(oldBytes)

    // Now export NEW content using the imported originalParts (has OLD document.xml inside)
    const newPm = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'NEW CONTENT XYZ' }] }
      ]
    }
    const newDoc = proseMirrorToDocx(newPm, imported.originalParts)
    const newBytes = await exportDocx(newDoc)
    const reopened = await importDocx(newBytes)
    const pm = docxToProseMirror(reopened) as {
      content: Array<{ content?: Array<{ text?: string }> }>
    }
    expect(pm.content[0].content?.[0].text).toBe('NEW CONTENT XYZ')
    expect(JSON.stringify(pm)).not.toContain('OLD CONTENT')
  })

  it('keeps originalParts map unchanged after export (no mutation)', async () => {
    const oldPm = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'OLD CONTENT' }] }
      ]
    }
    const oldDoc = proseMirrorToDocx(oldPm, new Map())
    const oldBytes = await exportDocx(oldDoc)
    const imported = await importDocx(oldBytes)
    const before = imported.originalParts.get('word/document.xml')

    const newPm = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'NEW CONTENT XYZ' }] }
      ]
    }
    const newDoc = proseMirrorToDocx(newPm, imported.originalParts)
    await exportDocx(newDoc)

    const after = imported.originalParts.get('word/document.xml')
    expect(after).toBe(before)
  })
})
