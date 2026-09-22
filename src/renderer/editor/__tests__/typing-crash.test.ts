// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import { createEditorExtensions } from '../extensions/schema'

describe('editor typing crash', () => {
  it('creates the editor with project extensions and accepts typing', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    let updates = 0

    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p>Comece a digitar seu documento…</p>',
      editorProps: { attributes: { class: 'doc-content min-h-[900px] outline-none' } },
      onUpdate: () => {
        updates += 1
      }
    })

    expect(editor.isEmpty).toBe(false)

    editor.commands.focus()
    editor.commands.insertContent('A')
    editor.commands.insertContent('B')
    editor.commands.insertContent('ç')
    editor.commands.insertContent('ão')

    expect(updates).toBeGreaterThan(0)
    expect(editor.getText()).toContain('ABção')

    // Enter (split) — costuma falhar com prosemirror-model duplicado
    editor.commands.keyboardShortcut('Enter')
    editor.commands.insertContent('linha 2')
    editor.commands.keyboardShortcut('Backspace')

    // Input rules disparam ao digitar espaço após marcadores
    editor.commands.keyboardShortcut('Enter')
    editor.commands.insertContent('- item')

    editor.destroy()
    expect(editor.isDestroyed).toBe(true)
  })

  it('does not register duplicate underline/gapCursor extensions', () => {
    const names = createEditorExtensions().map((e) => {
      // StarterKit é um pacote; extrai nomes dos filhos quando expandido
      const ext = e as unknown as { name?: string; options?: Record<string, unknown> }
      return ext.name
    })
    expect(names).not.toContain('underline')
    expect(names).not.toContain('gapCursor')
  })

  it('accepts typing after commands that used to clobber editorProps', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const editor = new Editor({
      element: el,
      extensions: createEditorExtensions(),
      content: '<p>abc</p>',
      editorProps: { attributes: { class: 'doc-content' } }
    })

    editor.commands.focus()
    editor.commands.insertContent('X')
    expect(editor.getText()).toContain('X')

    editor.setOptions({ editorProps: { attributes: { class: 'doc-content' } } })
    editor.commands.insertContent('Y')
    expect(editor.getText()).toContain('Y')

    editor.destroy()
  })
})
