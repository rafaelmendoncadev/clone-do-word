import type { Editor } from '@tiptap/react'

export function toggleBold(editor: Editor) {
  editor.chain().focus().toggleBold().run()
}

export function toggleItalic(editor: Editor) {
  editor.chain().focus().toggleItalic().run()
}

export function toggleUnderline(editor: Editor) {
  editor.chain().focus().toggleUnderline().run()
}

export function toggleStrike(editor: Editor) {
  editor.chain().focus().toggleStrike().run()
}

export function setFontFamily(editor: Editor, font: string) {
  editor.chain().focus().setFontFamily(font).run()
}

export function setFontSize(editor: Editor, size: string) {
  editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
}

export function setTextColor(editor: Editor, color: string) {
  editor.chain().focus().setColor(color).run()
}

export function setHighlight(editor: Editor, color: string) {
  editor.chain().focus().setHighlight({ color }).run()
}

export function setTextAlign(editor: Editor, align: 'left' | 'center' | 'right' | 'justify') {
  editor.chain().focus().setTextAlign(align).run()
}

export function toggleBulletList(editor: Editor) {
  editor.chain().focus().toggleBulletList().run()
}

export function toggleOrderedList(editor: Editor) {
  editor.chain().focus().toggleOrderedList().run()
}

export function setHeading(editor: Editor, level: 1 | 2 | 3 | 4 | 5 | 6) {
  editor.chain().focus().setHeading({ level }).run()
}

export function setParagraph(editor: Editor) {
  editor.chain().focus().setParagraph().run()
}

function paragraphIndent(editor: Editor, delta: number) {
  const current = Number(editor.getAttributes('paragraph').marginLeft) || 0
  const next = Math.max(0, current + delta)
  // paragraph não declara marginLeft no schema; usar estilo via updateAttributes
  // só funciona se o attr existir — fallback para lista quando possível.
  if (editor.isActive('listItem')) {
    return delta < 0
      ? editor.chain().focus().liftListItem('listItem').run()
      : editor.chain().focus().sinkListItem('listItem').run()
  }
  return editor
    .chain()
    .focus()
    .updateAttributes('paragraph', { marginLeft: next })
    .run()
}

export function indent(editor: Editor) {
  return paragraphIndent(editor, 40)
}

export function outdent(editor: Editor) {
  return paragraphIndent(editor, -40)
}

export function undo(editor: Editor) {
  editor.chain().focus().undo().run()
}

export function redo(editor: Editor) {
  editor.chain().focus().redo().run()
}

export function insertHorizontalRule(editor: Editor) {
  editor.chain().focus().setHorizontalRule().run()
}
