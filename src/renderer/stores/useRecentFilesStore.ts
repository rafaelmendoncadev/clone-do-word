import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentFile {
  path: string
  name: string
  lastOpened: string
}

interface RecentFilesState {
  files: RecentFile[]
  addFile: (file: RecentFile) => void
  clear: () => void
}

export const useRecentFilesStore = create<RecentFilesState>()(
  persist(
    (set) => ({
      files: [],
      addFile: (file) =>
        set((s) => ({
          files: [file, ...s.files.filter((f) => f.path !== file.path)].slice(0, 10)
        })),
      clear: () => set({ files: [] })
    }),
    {
      name: 'word-clone-recent-files'
    }
  )
)
