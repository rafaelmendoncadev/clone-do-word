import { create } from 'zustand'

interface DocumentState {
  fileName: string
  filePath: string | null
  dirty: boolean
  wordCount: number
  pageCount: number
  appVersion: string
  originalParts: Map<string, Uint8Array>
  setFileName: (name: string) => void
  setFilePath: (path: string | null) => void
  setDirty: (dirty: boolean) => void
  setWordCount: (n: number) => void
  setPageCount: (n: number) => void
  setAppVersion: (v: string) => void
  setOriginalParts: (parts: Map<string, Uint8Array>) => void
  markSaved: (path: string) => void
  newDocument: () => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  fileName: 'Documento sem título',
  filePath: null,
  dirty: false,
  wordCount: 0,
  pageCount: 1,
  appVersion: '',
  originalParts: new Map(),
  setFileName: (fileName) => set({ fileName }),
  setFilePath: (filePath) => set({ filePath }),
  setDirty: (dirty) => {
    set({ dirty })
    void window.api?.window.setDirty(dirty)
  },
  setWordCount: (wordCount) => set({ wordCount }),
  setPageCount: (pageCount) => set({ pageCount }),
  setAppVersion: (appVersion) => set({ appVersion }),
  setOriginalParts: (originalParts) => set({ originalParts }),
  markSaved: (filePath) => {
    set({ filePath, dirty: false, fileName: filePath.split(/[\\/]/).pop() || 'Documento' })
    void window.api?.window.setDirty(false)
    void window.api?.window.setTitle(filePath.split(/[\\/]/).pop() || 'Documento', false)
  },
  newDocument: () => {
    set({
      fileName: 'Documento sem título',
      filePath: null,
      dirty: false,
      wordCount: 0,
      pageCount: 1,
      originalParts: new Map()
    })
    void window.api?.window.setDirty(false)
  }
}))
