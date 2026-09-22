import { useState, useEffect, useRef } from 'react'
import { useEditorStore } from '../../stores/useEditorStore'

interface Props {
  open: boolean
  onClose: () => void
  mode: 'find' | 'replace'
}

export function FindReplacePanel({ open, onClose, mode }: Props) {
  const editor = useEditorStore((s) => s.editor)
  const [search, setSearch] = useState('')
  const [replace, setReplace] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [count, setCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!editor || !search) {
      setCount(0)
      return
    }
    try {
      const text = editor.getText()
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(wholeWord ? `\\b${escaped}\\b` : escaped, matchCase ? 'g' : 'gi')
      const matches = text.match(regex)
      setCount(matches ? matches.length : 0)
    } catch {
      setCount(0)
    }
  }, [editor, search, matchCase, wholeWord])

  if (!open || !editor) return null

  const handleFind = () => {
    if (!search || !editor) return
    const text = editor.getText()
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(wholeWord ? `\\b${escaped}\\b` : escaped, matchCase ? 'g' : 'gi')
    const match = regex.exec(text)
    if (match) {
      // Focar no editor — highlight completo requer extensão ProseMirror
      editor.commands.focus()
    }
  }

  const handleReplaceAll = () => {
    if (!search) return
    const text = editor.getText()
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(wholeWord ? `\\b${escaped}\\b` : escaped, matchCase ? 'g' : 'gi')
    const newText = text.replace(regex, replace)
    editor.commands.setContent(newText.split('\n').map((l) => `<p>${l}</p>`).join(''))
  }

  return (
    <div className="fixed right-4 top-20 z-40 w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{mode === 'find' ? 'Localizar' : 'Localizar e Substituir'}</h3>
        <button className="text-neutral-400 hover:text-neutral-600" onClick={onClose}>✕</button>
      </div>
      <input
        ref={inputRef}
        type="text"
        className="mb-2 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        placeholder="Localizar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleFind()}
      />
      {mode === 'replace' && (
        <input
          type="text"
          className="mb-2 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          placeholder="Substituir por"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
        />
      )}
      <div className="mb-3 flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
          Maiúsc/minúsc
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
          Palavra inteira
        </label>
      </div>
      {search && <div className="mb-3 text-xs text-neutral-500">{count} ocorrência(s)</div>}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded bg-office-blue px-3 py-1.5 text-sm text-white hover:bg-office-blue-dark"
          onClick={handleFind}
        >
          Localizar
        </button>
        {mode === 'replace' && (
          <button
            className="flex-1 rounded bg-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-300"
            onClick={handleReplaceAll}
          >
            Substituir tudo
          </button>
        )}
      </div>
    </div>
  )
}
