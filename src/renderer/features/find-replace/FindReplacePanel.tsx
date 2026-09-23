import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '../../stores/useEditorStore'
import { Search, Replace, ChevronDown, ChevronUp, X } from 'lucide-react'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

interface Props {
  open: boolean
  onClose: () => void
  mode: 'find' | 'replace'
}

interface MatchItem {
  from: number
  to: number
  text: string
}

function findMatchesInDoc(
  doc: ProseMirrorNode,
  query: string,
  matchCase: boolean,
  wholeWord: boolean
): MatchItem[] {
  if (!query) return []
  const matches: MatchItem[] = []
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped
  const flags = matchCase ? 'g' : 'gi'

  let regex: RegExp
  try {
    regex = new RegExp(pattern, flags)
  } catch {
    return []
  }

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    let m: RegExpExecArray | null
    while ((m = regex.exec(node.text)) !== null) {
      const from = pos + m.index
      const to = from + m[0].length
      matches.push({ from, to, text: m[0] })
      if (!regex.global) break
    }
  })

  return matches
}

export function FindReplacePanel({ open, onClose, mode }: Props) {
  const editor = useEditorStore((s) => s.editor)
  const [search, setSearch] = useState('')
  const [replace, setReplace] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const updateMatches = useCallback(() => {
    if (!editor || !search) {
      setMatches([])
      setCurrentIndex(-1)
      return
    }
    const found = findMatchesInDoc(editor.state.doc, search, matchCase, wholeWord)
    setMatches(found)
    if (found.length === 0) {
      setCurrentIndex(-1)
    } else if (currentIndex >= found.length) {
      setCurrentIndex(0)
    }
  }, [editor, search, matchCase, wholeWord, currentIndex])

  useEffect(() => {
    updateMatches()
  }, [updateMatches])

  if (!open || !editor) return null

  const highlightMatch = (index: number, list = matches) => {
    if (list.length === 0 || index < 0 || index >= list.length) return
    const target = list[index]
    editor.chain().focus().setTextSelection({ from: target.from, to: target.to }).scrollIntoView().run()
    setCurrentIndex(index)
  }

  const handleNext = () => {
    if (matches.length === 0) return
    const nextIdx = (currentIndex + 1) % matches.length
    highlightMatch(nextIdx)
  }

  const handlePrev = () => {
    if (matches.length === 0) return
    const prevIdx = (currentIndex - 1 + matches.length) % matches.length
    highlightMatch(prevIdx)
  }

  const handleReplaceSingle = () => {
    if (!search || !editor) return
    const currentMatches = findMatchesInDoc(editor.state.doc, search, matchCase, wholeWord)
    if (currentMatches.length === 0) return

    const idx = currentIndex >= 0 && currentIndex < currentMatches.length ? currentIndex : 0
    const target = currentMatches[idx]

    editor.chain().focus().insertContentAt({ from: target.from, to: target.to }, replace).run()

    // Recalcular matches e avançar
    setTimeout(() => {
      const refreshed = findMatchesInDoc(editor.state.doc, search, matchCase, wholeWord)
      setMatches(refreshed)
      if (refreshed.length > 0) {
        const nextIdx = idx >= refreshed.length ? 0 : idx
        highlightMatch(nextIdx, refreshed)
      } else {
        setCurrentIndex(-1)
      }
    }, 10)
  }

  const handleReplaceAll = () => {
    if (!search || !editor) return
    const currentMatches = findMatchesInDoc(editor.state.doc, search, matchCase, wholeWord)
    if (currentMatches.length === 0) return

    // Ordenar de trás para frente para manter os índices absolutos válidos
    const sorted = [...currentMatches].sort((a, b) => b.from - a.from)
    const tr = editor.state.tr

    for (const m of sorted) {
      tr.insertText(replace, m.from, m.to)
    }

    editor.view.dispatch(tr)
    setMatches([])
    setCurrentIndex(-1)
  }

  return (
    <div className="fixed right-6 top-24 z-40 w-88 rounded-lg border border-neutral-300 bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          {mode === 'find' ? (
            <Search className="h-4 w-4 text-office-blue" />
          ) : (
            <Replace className="h-4 w-4 text-office-blue" />
          )}
          <span>{mode === 'find' ? 'Localizar' : 'Localizar e Substituir'}</span>
        </div>
        <button
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          onClick={onClose}
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            className="w-full rounded border border-neutral-300 px-2.5 py-1.5 pr-16 text-xs text-neutral-800 focus:border-office-blue focus:outline-none"
            placeholder="Localizar no documento…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (e.shiftKey) handlePrev()
                else handleNext()
              }
            }}
          />
          {search && (
            <span className="absolute right-2 text-[10px] font-medium text-neutral-500">
              {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
            </span>
          )}
        </div>
      </div>

      {mode === 'replace' && (
        <div className="mb-2">
          <input
            type="text"
            className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-800 focus:border-office-blue focus:outline-none"
            placeholder="Substituir por…"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
          />
        </div>
      )}

      <div className="mb-3 flex items-center gap-4 text-xs text-neutral-600">
        <label className="flex cursor-pointer items-center gap-1.5 select-none">
          <input
            type="checkbox"
            className="rounded border-neutral-300 text-office-blue"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
          />
          Maiúsc/minúsc
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 select-none">
          <input
            type="checkbox"
            className="rounded border-neutral-300 text-office-blue"
            checked={wholeWord}
            onChange={(e) => setWholeWord(e.target.checked)}
          />
          Palavra inteira
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 rounded bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
            disabled={matches.length === 0}
            onClick={handlePrev}
            title="Ocorrência anterior (Shift+Enter)"
          >
            <ChevronUp className="h-3.5 w-3.5" /> Anterior
          </button>
          <button
            className="flex items-center gap-1 rounded bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
            disabled={matches.length === 0}
            onClick={handleNext}
            title="Próxima ocorrência (Enter)"
          >
            <ChevronDown className="h-3.5 w-3.5" /> Próxima
          </button>
        </div>

        {mode === 'replace' && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              className="rounded bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
              disabled={matches.length === 0}
              onClick={handleReplaceSingle}
            >
              Substituir
            </button>
            <button
              className="rounded bg-office-blue px-2.5 py-1 text-xs font-medium text-white hover:bg-office-blue-dark disabled:opacity-40"
              disabled={matches.length === 0}
              onClick={handleReplaceAll}
            >
              Substituir tudo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
