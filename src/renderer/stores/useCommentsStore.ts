import { create } from 'zustand'

export interface DocumentComment {
  id: string
  author: string
  text: string
  createdAt: string
  resolved: boolean
  quote?: string
}

interface CommentsState {
  comments: DocumentComment[]
  addComment: (text: string, quote?: string, author?: string) => void
  resolveComment: (id: string) => void
  reopenComment: (id: string) => void
  deleteComment: (id: string) => void
  clearComments: () => void
}

export const useCommentsStore = create<CommentsState>((set) => ({
  comments: [],
  addComment: (text, quote, author = 'Usuário') =>
    set((state) => ({
      comments: [
        ...state.comments,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          author,
          text: text.trim(),
          createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          resolved: false,
          quote: quote?.trim() || undefined
        }
      ]
    })),
  resolveComment: (id) =>
    set((state) => ({
      comments: state.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c))
    })),
  reopenComment: (id) =>
    set((state) => ({
      comments: state.comments.map((c) => (c.id === id ? { ...c, resolved: false } : c))
    })),
  deleteComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id)
    })),
  clearComments: () => set({ comments: [] })
}))
