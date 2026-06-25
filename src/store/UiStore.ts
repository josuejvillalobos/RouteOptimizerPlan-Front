import { create } from 'zustand'

interface OrigenPos { lat: number; lng: number }
interface UIStore {
  panelOpen: boolean
  setPanelOpen: (v: boolean) => void
  togglePanel: () => void
  origenPendiente: OrigenPos | null
  origenAnterior: OrigenPos | null
  setOrigenPendiente: (pos: OrigenPos | null) => void
  setOrigenAnterior: (pos: OrigenPos | null) => void
  cancelarOrigen: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  panelOpen: true,
  setPanelOpen: (v) => set({ panelOpen: v }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  origenPendiente: null,
  origenAnterior: null,
  setOrigenPendiente: (pos) => set({ origenPendiente: pos }),
  setOrigenAnterior: (pos) => set({ origenAnterior: pos }),
  cancelarOrigen: () => set({ origenPendiente: null, origenAnterior: null }),
}))