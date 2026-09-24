import { useState } from 'react'
import { useEditorStore } from '../../stores/useEditorStore'
import { useCommentsStore } from '../../stores/useCommentsStore'
import { X, MessageSquare, Check, Trash2, RotateCcw } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function CommentsPane({ open, onClose }: Props) {
  const editor = useEditorStore((s) => s.editor)
  const { comments, addComment, resolveComment, reopenComment, deleteComment } = useCommentsStore()
  const [newComment, setNewComment] = useState('')

  if (!open || !editor) return null

  const handleAddComment = () => {
    if (!newComment.trim()) return

    let quote: string | undefined
    if (editor) {
      const { from, to } = editor.state.selection
      if (from !== to) {
        quote = editor.state.doc.textBetween(from, to, ' ')
      }
    }

    addComment(newComment, quote)
    setNewComment('')
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-neutral-200 bg-white shadow-sm print:hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <MessageSquare className="h-4 w-4 text-office-blue" />
          <span>Comentários ({comments.length})</span>
        </div>
        <button
          className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
          onClick={onClose}
          title="Fechar painel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {comments.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-neutral-400">
            <MessageSquare className="mb-2 h-6 w-6 stroke-1 text-neutral-300" />
            <p>Nenhum comentário adicionado.</p>
            <p className="mt-1 text-[11px] text-neutral-400">
              Selecione um texto no documento e digite abaixo.
            </p>
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={`mb-3 rounded-lg border p-3 transition-colors ${
                c.resolved ? 'border-neutral-200 bg-neutral-50 opacity-60' : 'border-blue-100 bg-blue-50/30'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800">{c.author}</span>
                <span className="text-[10px] text-neutral-400">{c.createdAt}</span>
              </div>
              {c.quote && (
                <div className="mb-2 border-l-2 border-office-blue bg-white/70 px-2 py-1 text-xs italic text-neutral-600">
                  “{c.quote}”
                </div>
              )}
              <p className="mb-2 text-sm text-neutral-700">{c.text}</p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                {c.resolved ? (
                  <button
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                    onClick={() => reopenComment(c.id)}
                  >
                    <RotateCcw className="h-3 w-3" /> Reabrir
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-1 text-emerald-600 hover:underline"
                    onClick={() => resolveComment(c.id)}
                  >
                    <Check className="h-3 w-3" /> Resolver
                  </button>
                )}
                <button
                  className="flex items-center gap-1 text-red-600 hover:underline"
                  onClick={() => deleteComment(c.id)}
                >
                  <Trash2 className="h-3 w-3" /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50/50 p-3">
        <textarea
          className="mb-2 w-full resize-none rounded-md border border-neutral-300 p-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:border-office-blue focus:outline-none focus:ring-1 focus:ring-office-blue"
          rows={3}
          placeholder="Adicionar um comentário…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              handleAddComment()
            }
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-400">Ctrl+Enter para enviar</span>
          <button
            className="rounded bg-office-blue px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-office-blue-dark disabled:opacity-50"
            disabled={!newComment.trim()}
            onClick={handleAddComment}
          >
            Comentar
          </button>
        </div>
      </div>
    </div>
  )
}
