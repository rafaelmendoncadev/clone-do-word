import type { Editor } from '@tiptap/react'
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleBulletList,
  setHeading,
  setParagraph,
  redo,
  indent,
  outdent,
  setTextAlign
} from './editor-commands'

/**
 * Fallback de atalhos via handleKeyDown.
 * Emite apenas como camada extra; a fonte primária é a extensão KeyboardShortcuts.
 * Nunca deve lançar: um throw aqui derruba o handler do ProseMirror durante a digitação.
 */
export function setupKeyboardShortcuts(editor: Editor) {
  const previous = editor.options.editorProps

  editor.setOptions({
    editorProps: {
      ...previous,
      handleKeyDown: (view, event) => {
        try {
          if (typeof event.key !== 'string') return false

          const mod = event.ctrlKey || event.metaKey
          if (!mod) return false

          const key = event.key.toLowerCase()

          switch (key) {
            case 'b':
              event.preventDefault()
              toggleBold(editor)
              return true
            case 'i':
              event.preventDefault()
              toggleItalic(editor)
              return true
            case 'u':
              event.preventDefault()
              toggleUnderline(editor)
              return true
            case 'z':
              if (event.shiftKey) {
                event.preventDefault()
                redo(editor)
                return true
              }
              return false
            case 'y':
              event.preventDefault()
              redo(editor)
              return true
            case 'e':
              event.preventDefault()
              setTextAlign(editor, 'center')
              return true
            case 'l':
              event.preventDefault()
              setTextAlign(editor, 'left')
              return true
            case 'r':
              event.preventDefault()
              setTextAlign(editor, 'right')
              return true
            case 'j':
              event.preventDefault()
              setTextAlign(editor, 'justify')
              return true
            case 'm':
              event.preventDefault()
              if (event.shiftKey) outdent(editor)
              else indent(editor)
              return true
            case 'shift':
              return false
          }

          if (mod && event.shiftKey && key === 'l') {
            event.preventDefault()
            toggleBulletList(editor)
            return true
          }

          if (mod && event.altKey) {
            const num = parseInt(key, 10)
            if (num >= 1 && num <= 6) {
              event.preventDefault()
              setHeading(editor, num as 1 | 2 | 3 | 4 | 5 | 6)
              return true
            }
            if (num === 0) {
              event.preventDefault()
              setParagraph(editor)
              return true
            }
          }

          return false
        } catch {
          // Não propaga: evita derrubar o renderer ao digitar
          return false
        }
      }
    }
  })
}
