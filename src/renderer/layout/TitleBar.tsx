import { useDocumentStore } from '../stores/useDocumentStore'

export function TitleBar() {
  const { fileName, dirty, wordCount } = useDocumentStore()

  return (
    <div className="flex h-9 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-blue-700">W</span>
        <span className="text-neutral-500">|</span>
        <span className="truncate">
          {dirty && <span className="mr-1 text-amber-500">●</span>}
          {fileName}
        </span>
      </div>
      <div className="text-xs text-neutral-400">{wordCount} palavras</div>
    </div>
  )
}
