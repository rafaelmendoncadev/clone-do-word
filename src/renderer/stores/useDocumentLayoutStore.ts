import { create } from 'zustand'
import type { PageSetup, HeaderFooterConfig } from '../editor/page-setup'
import { DEFAULT_HEADER_FOOTER } from '../editor/page-setup'

const DEFAULT_SETUP: PageSetup = {
  size: 'a4',
  orientation: 'portrait',
  margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 }
}

interface DocumentLayoutState {
  setup: PageSetup
  headerFooter: HeaderFooterConfig
  setupDialogOpen: boolean
  setSetup: (s: PageSetup) => void
  setHeaderFooter: (hf: HeaderFooterConfig) => void
  setSetupDialogOpen: (open: boolean) => void
}

export const useDocumentLayoutStore = create<DocumentLayoutState>((set) => ({
  setup: DEFAULT_SETUP,
  headerFooter: DEFAULT_HEADER_FOOTER,
  setupDialogOpen: false,
  setSetup: (setup) => set({ setup }),
  setHeaderFooter: (headerFooter) => set({ headerFooter }),
  setSetupDialogOpen: (setupDialogOpen) => set({ setupDialogOpen })
}))
