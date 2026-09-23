import { create } from 'zustand'

interface EditorUiState {
  zoom: number
  activeRibbonTab: string
  showRuler: boolean
  showStylesPane: boolean
  showCommentsPane: boolean
  showTocPane: boolean
  showFindReplace: boolean
  findReplaceMode: 'find' | 'replace'
  showBackstage: boolean
  setZoom: (z: number) => void
  setActiveRibbonTab: (tab: string) => void
  toggleRuler: () => void
  toggleStylesPane: () => void
  toggleCommentsPane: () => void
  toggleTocPane: () => void
  toggleFindReplace: () => void
  setFindReplaceMode: (mode: 'find' | 'replace') => void
  toggleBackstage: () => void
  setBackstage: (open: boolean) => void
}

export const useEditorUiStore = create<EditorUiState>((set) => ({
  zoom: 100,
  activeRibbonTab: 'home',
  showRuler: true,
  showStylesPane: false,
  showCommentsPane: false,
  showTocPane: false,
  showFindReplace: false,
  findReplaceMode: 'find',
  showBackstage: false,
  setZoom: (zoom) => set({ zoom }),
  setActiveRibbonTab: (activeRibbonTab) => set({ activeRibbonTab }),
  toggleRuler: () => set((s) => ({ showRuler: !s.showRuler })),
  toggleStylesPane: () => set((s) => ({ showStylesPane: !s.showStylesPane })),
  toggleCommentsPane: () => set((s) => ({ showCommentsPane: !s.showCommentsPane })),
  toggleTocPane: () => set((s) => ({ showTocPane: !s.showTocPane })),
  toggleFindReplace: () => set((s) => ({ showFindReplace: !s.showFindReplace })),
  setFindReplaceMode: (findReplaceMode) => set({ findReplaceMode, showFindReplace: true }),
  toggleBackstage: () => set((s) => ({ showBackstage: !s.showBackstage })),
  setBackstage: (showBackstage) => set({ showBackstage })
}))
