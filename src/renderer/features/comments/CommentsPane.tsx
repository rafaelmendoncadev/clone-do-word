import { useState } from 'react'
import { useEditorStore } from '../../stores/useEditorStore'

export interface Comment {
  id: string
  author: string
  text: string
  timestamp: Date
  resolved: boolean
}

interface Props {
  open: boolean
  onClose: () => void
}

export function CommentsPane({ open, onClose }: Props) {
  const editor = useEditorStore((s) => s.editor)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  if (!open || !editor) return null

  const addComment = () => {
    if (!newComment.trim()) return
    setComments([
      ...comments,
      { id: Date.now().toString(), author: 'Usuário', text: newComment.trim(), timestamp: new Date(), resolved: false }
    ])
    setNewComment('')
  }

  return (
    <div className="flex h-full w-72 flex-col border-l border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
        <h3 className="text-sm font-semibold">Comentários</h3>
        <button className="text-neutral-400 hover:text-neutral-600" onClick={onClose}>✕</button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {comments.length === 0 && <p className="text-sm text-neutral-400">Nenhum comentário ainda.</p>}
        {comments.map((c) => (
          <div key={c.id} className={`mb-3 rounded-lg border p-2 ${c.resolved ? 'opacity-50' : ''}`}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium">{c.author}</span>
              <span className="text-[10px] text-neutral-400">{c.timestamp.toLocaleTimeString()}</span>
            </div>
            <p className="mb-2 text-sm">{c.text}</p>
            <div className="flex gap-2">
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => setComments(comments.map((x) => (x.id === c.id ? { ...x, resolved: !x.resolved } : x)))}
              >
                {c.resolved ? 'Reabrir' : 'Resolver'}
              </button>
              <button
                className="text-xs text-red-600 hover:underline"
                onClick={() => setComments(comments.filter((x) => x.id !== c.id))}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-200 p-3">
        <textarea
          className="mb-2 w-full resize-none rounded border border-neutral-300 p-2 text-sm"
          rows={2}
          placeholder="Adicionar comentário…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="w-full rounded bg-office-blue px-3 py-1.5 text-sm text-white hover:bg-office-blue-dark"
          onClick={addComment}
        >
          Comentar
        </button>
      </div>
    </div>
  )
}
