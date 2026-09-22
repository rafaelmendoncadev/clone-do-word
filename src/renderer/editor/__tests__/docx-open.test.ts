// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Editor } from '@tiptap/core'
import { createEditorExtensions } from '../extensions/schema'
import { importDocx, docxToProseMirror } from '../../../docx'
import { toUint8Array } from '../../../docx/import/bytes'

const fixture = (name: string) =>
  new Uint8Array(readFileSync(join(__dirname, '../../../docx/__tests__/fixtures', name)))

describe('docx → TipTap setContent', () => {
  it('loads imported document into the editor', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p></p>'
    })

    const bytes = toUint8Array(fixture('single-paragraph.docx'))
    const doc = await importDocx(bytes)
    editor.commands.setContent(docxToProseMirror(doc))

    expect(editor.isEmpty).toBe(false)
    expect(editor.getText().length).toBeGreaterThan(0)
    editor.destroy()
  })

  it('loads a document with tables', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p></p>'
    })

    const doc = await importDocx(fixture('tables.docx'))
    editor.commands.setContent(docxToProseMirror(doc))
    expect(editor.getJSON().content?.length).toBeGreaterThan(0)
    editor.destroy()
  })
})
