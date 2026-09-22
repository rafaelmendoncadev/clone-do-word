import { create } from 'zustand'

interface SettingsState {
  theme: 'light' | 'dark'
  language: string
  autoSave: boolean
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: string) => void
  setAutoSave: (autoSave: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  language: 'pt-BR',
  autoSave: false,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setAutoSave: (autoSave) => set({ autoSave })
}))
