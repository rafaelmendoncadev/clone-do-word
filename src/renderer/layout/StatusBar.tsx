import { useDocumentStore } from '../stores/useDocumentStore'
import { useEditorUiStore } from '../stores/useEditorUiStore'

export function StatusBar() {
  const { wordCount, pageCount } = useDocumentStore()
  const { zoom, setZoom } = useEditorUiStore()

  return (
    <div className="flex h-6 items-center justify-between border-t border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-500">
      <div className="flex items-center gap-4">
        <span>Página 1 de {pageCount || 1}</span>
        <span>{wordCount} palavras</span>
        <span>Português (Brasil)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-1 hover:text-neutral-800"
          onClick={() => setZoom(Math.max(50, zoom - 10))}
        >
          −
        </button>
        <span className="w-10 text-center">{zoom}%</span>
        <button
          className="px-1 hover:text-neutral-800"
          onClick={() => setZoom(Math.min(200, zoom + 10))}
        >
          +
        </button>
      </div>
    </div>
  )
}
