import { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '../../stores/useEditorStore'
import { ListTree, X, RefreshCw } from 'lucide-react'

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
    <div className="w-64 border-l border-neutral-200 bg-white p-3 shadow-sm flex flex-col h-full">
      <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
          <ListTree className="h-4 w-4 text-office-blue" />
          <span>SUMÁRIO DO DOCUMENTO</span>
        </div>
        <button
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          onClick={onClose}
          title="Fechar sumário"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <button
        className="mb-3 flex items-center justify-center gap-1.5 w-full rounded border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
        onClick={refreshToc}
      >
        <RefreshCw className="h-3.5 w-3.5 text-neutral-500" />
        Atualizar sumário
      </button>

      <div className="flex flex-col gap-1 overflow-auto flex-1">
        {headings.map((h, i) => (
          <button
            key={i}
            className="rounded px-2 py-1 text-left text-xs hover:bg-blue-50 hover:text-office-blue transition-colors truncate"
            style={{ paddingLeft: `${(h.level - 1) * 14 + 8}px` }}
            onClick={() => editor.chain().focus().setTextSelection(h.pos + 1).scrollIntoView().run()}
            title={h.text}
          >
            <span className="font-semibold text-neutral-400 mr-1.5">T{h.level}</span>
            <span className="text-neutral-700">{h.text || '(Sem texto)'}</span>
          </button>
        ))}
        {headings.length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-400">
            Nenhum título (Título 1, 2, 3) encontrado no documento.
          </div>
        )}
      </div>
    </div>
  )
}
