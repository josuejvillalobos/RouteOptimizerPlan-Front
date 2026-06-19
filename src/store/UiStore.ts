import { create } from 'zustand'

interface UIStore {
  panelOpen: boolean
  setPanelOpen: (v: boolean) => void
  togglePanel: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  panelOpen: true,
  setPanelOpen: (v) => set({ panelOpen: v }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
}))