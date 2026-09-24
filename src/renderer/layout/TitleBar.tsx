import { useDocumentStore } from '../stores/useDocumentStore'
import { Save } from 'lucide-react'

export function TitleBar() {
  const { fileName, dirty, wordCount } = useDocumentStore()

  const handleQuickSave = () => {
    window.dispatchEvent(new CustomEvent('app:save'))
  }

  return (
    <div className="flex h-9 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 text-sm select-none print:hidden">
      <div className="flex items-center gap-2">
        <span className="font-bold text-blue-700">W</span>
        <button
          onClick={handleQuickSave}
          title={dirty ? 'Salvar alterações (Ctrl+S)' : 'Salvar (Ctrl+S)'}
          className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
            dirty
              ? 'text-blue-700 hover:bg-blue-100 hover:text-blue-800'
              : 'text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800'
          }`}
        >
          <Save className="h-4 w-4" />
        </button>
        <span className="text-neutral-300">|</span>
        <span className="truncate">
          {dirty && <span className="mr-1 text-amber-500" title="Alterações não salvas">●</span>}
          {fileName}
        </span>
      </div>
      <div className="text-xs text-neutral-400">{wordCount} palavras</div>
    </div>
  )
}
