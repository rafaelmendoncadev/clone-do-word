import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import { Extension } from '@tiptap/core'
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleBulletList,
  setHeading,
  setParagraph,
  undo,
  redo,
  indent,
  outdent,
  setTextAlign
} from '../../lib/editor-commands'

/**
 * Atalhos via Extensão (em vez de setOptions/editorProps) para não
 * sobrescrever props do useEditor e não reinicializar a view no meio da digitação.
 */
const KeyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',
  addKeyboardShortcuts() {
    return {
      'Mod-s': () => {
        window.dispatchEvent(new CustomEvent('app:save'))
        return true
      },
      'Mod-b': () => {
        toggleBold(this.editor)
        return true
      },
      'Mod-i': () => {
        toggleItalic(this.editor)
        return true
      },
      'Mod-u': () => {
        toggleUnderline(this.editor)
        return true
      },
      'Mod-z': () => {
        undo(this.editor)
        return true
      },
      'Mod-y': () => {
        redo(this.editor)
        return true
      },
      'Mod-Shift-z': () => {
        redo(this.editor)
        return true
      },
      'Mod-e': () => {
        setTextAlign(this.editor, 'center')
        return true
      },
      'Mod-l': () => {
        setTextAlign(this.editor, 'left')
        return true
      },
      'Mod-r': () => {
        setTextAlign(this.editor, 'right')
        return true
      },
      'Mod-j': () => {
        setTextAlign(this.editor, 'justify')
        return true
      },
      'Mod-m': () => {
        indent(this.editor)
        return true
      },
      'Mod-Shift-m': () => {
        outdent(this.editor)
        return true
      },
      'Mod-Shift-l': () => {
        toggleBulletList(this.editor)
        return true
      },
      'Mod-Alt-1': () => {
        setHeading(this.editor, 1)
        return true
      },
      'Mod-Alt-2': () => {
        setHeading(this.editor, 2)
        return true
      },
      'Mod-Alt-3': () => {
        setHeading(this.editor, 3)
        return true
      },
      'Mod-Alt-4': () => {
        setHeading(this.editor, 4)
        return true
      },
      'Mod-Alt-5': () => {
        setHeading(this.editor, 5)
        return true
      },
      'Mod-Alt-6': () => {
        setHeading(this.editor, 6)
        return true
      },
      'Mod-Alt-0': () => {
        setParagraph(this.editor)
        return true
      }
    }
  }
})

export function createEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      code: false,
      codeBlock: false
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    FontFamily,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Image.configure({ inline: true, allowBase64: true }),
    KeyboardShortcuts
  ]
}

/** Instável entre renders só se chamado a cada render — preferir createEditorExtensions(). */
export const editorExtensions = createEditorExtensions()
