import { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '../../stores/useEditorStore'

interface Props {
  open: boolean
  onClose: () => void
}

export function TocPanel({ open, onClose }: Props) {
  const editor = useEditorStore((s) => s.editor)
  const [headings, setHeadings] = useState<{ level: number; text: string; pos: number }[]>([])

  const refreshToc = useCallback(() => {
    if (!editor) return
    const items: { level: number; text: string; pos: number }[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        items.push({ level: node.attrs.level as number, text: node.textContent, pos })
      }
    })
    setHeadings(items)
  }, [editor])

  useEffect(() => {
    refreshToc()
  }, [refreshToc])

  if (!open || !editor) return null

  return (
    <div className="w-56 border-l border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-neutral-500">SUMÁRIO</h3>
        <button className="text-neutral-400 hover:text-neutral-600" onClick={onClose}>✕</button>
      </div>
      <button
        className="mb-3 w-full rounded bg-neutral-200 px-2 py-1 text-xs hover:bg-neutral-300"
        onClick={refreshToc}
      >
        Atualizar sumário
      </button>
      <div className="flex flex-col gap-1">
        {headings.map((h, i) => (
          <button
            key={i}
            className="rounded px-1 py-0.5 text-left text-xs hover:bg-neutral-100"
            style={{ paddingLeft: `${(h.level - 1) * 12 + 4}px` }}
            onClick={() => editor.commands.focus(h.pos)}
          >
            <span className="text-neutral-400">{h.level}. </span>
            {h.text}
          </button>
        ))}
        {headings.length === 0 && <p className="text-xs text-neutral-400">Nenhum título encontrado.</p>}
      </div>
    </div>
  )
}
