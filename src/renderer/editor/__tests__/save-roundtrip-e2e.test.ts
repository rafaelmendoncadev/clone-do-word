// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Editor } from '@tiptap/core'
import { createEditorExtensions } from '../extensions/schema'
import { setTextAlign } from '../../lib/editor-commands'
import {
  importDocx,
  docxToProseMirror,
  exportDocx,
  proseMirrorToDocx
} from '../../../docx'

const fixture = (name: string) =>
  new Uint8Array(readFileSync(join(__dirname, '../../../docx/__tests__/fixtures', name)))

describe('open → edit → save → reopen (App.tsx flow)', () => {
  it('persists text edits through TipTap getJSON and export', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p></p>'
    })

    // 1. Open (open-docx.ts)
    const initialDoc = await importDocx(fixture('single-paragraph.docx'))
    const pmDoc = docxToProseMirror(initialDoc)
    editor.commands.setContent(pmDoc)

    const originalText = editor.getText()
    expect(originalText.length).toBeGreaterThan(0)

    // 2. Edit (user types)
    editor.commands.focus()
    editor.commands.insertContent(' ALTERADO')
    expect(editor.getText()).toContain('ALTERADO')

    // 3. Save (App.tsx handleSave)
    const pmAfterEdit = editor.getJSON()
    const docToExport = proseMirrorToDocx(pmAfterEdit, initialDoc.originalParts)
    const bytes = await exportDocx(docToExport)

    // 4. Reopen
    const reopened = await importDocx(bytes)
    const pmReopened = docxToProseMirror(reopened) as {
      type: string
      content: Array<{
        type: string
        content?: Array<{ type: string; text?: string }>
      }>
    }

    const flat = JSON.stringify(pmReopened)
    expect(flat).toContain('ALTERADO')

    // Also load into a fresh editor like open-docx does
    const el2 = document.createElement('div')
    document.body.appendChild(el2)
    const editor2 = new Editor({
      element: el2,
      extensions: createEditorExtensions(),
      content: '<p></p>'
    })
    editor2.commands.setContent(pmReopened)
    expect(editor2.getText()).toContain('ALTERADO')

    editor.destroy()
    editor2.destroy()
  })

  it('persists when replacing all content (delete + retype)', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p></p>'
    })

    const initialDoc = await importDocx(fixture('single-paragraph.docx'))
    editor.commands.setContent(docxToProseMirror(initialDoc))

    // Select all and replace
    editor.commands.selectAll()
    editor.commands.insertContent({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Parágrafo 1 novo' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Parágrafo 2 novo' }]
        }
      ]
    })

    const pmDoc = editor.getJSON()
    const docToExport = proseMirrorToDocx(pmDoc, initialDoc.originalParts)
    const bytes = await exportDocx(docToExport)
    const reopened = await importDocx(bytes)
    const pmReopened = docxToProseMirror(reopened) as {
      content: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>
    }

    expect(pmReopened.content).toHaveLength(2)
    expect(JSON.stringify(pmReopened)).toContain('Parágrafo 1 novo')
    expect(JSON.stringify(pmReopened)).toContain('Parágrafo 2 novo')
    expect(JSON.stringify(pmReopened)).not.toContain('single-paragraph')

    editor.destroy()
  })

  it('persists text alignment (heading centered via setTextAlign)', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p></p>'
    })

    editor.commands.setContent({
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Título' }] }]
    })
    editor.commands.selectAll()
    setTextAlign(editor, 'center')

    const pmDoc = editor.getJSON()
    const docToExport = proseMirrorToDocx(pmDoc, new Map())
    expect(docToExport.body[0]).toMatchObject({ type: 'paragraph', pPr: { align: 'center' } })

    const bytes = await exportDocx(docToExport)
    const reopened = await importDocx(bytes)
    const pmReopened = docxToProseMirror(reopened) as {
      content: Array<{ type: string; attrs?: Record<string, unknown> }>
    }
    expect(pmReopened.content[0].type).toBe('heading')
    expect(pmReopened.content[0].attrs?.textAlign).toBe('center')

    editor.destroy()
  })

  it('persists bold/formatting marks', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p></p>'
    })

    editor.commands.insertContent([
      { type: 'text', text: 'texto com ' },
      { type: 'text', text: 'negrito', marks: [{ type: 'bold' }] },
      { type: 'text', text: ' e normal' }
    ])

    const pmDoc = editor.getJSON()
    const docToExport = proseMirrorToDocx(pmDoc, new Map())
    const bytes = await exportDocx(docToExport)
    const reopened = await importDocx(bytes)
    const pmReopened = docxToProseMirror(reopened)

    const flat = JSON.stringify(pmReopened)
    expect(flat).toContain('negrito')
    expect(flat).toContain('bold')
    editor.destroy()
  })
})
