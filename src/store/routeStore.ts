import { create } from 'zustand'
import type { Stop, TipoTransporte, RutaOptimizada } from '../types/routeTypes'
import { optimizarRuta, getClima, type ClimateInfo } from '../services/api'

const INICIO_DEFAULT: Stop = {
  etiqueta: 'Almacen MIAA — Plaza Patria',
  calle: 'Plaza de la Patria, Centro, Aguascalientes',
  latitud: 21.8805,
  longitud: -102.2963,
}

interface RouteStore {
  puntoInicio: Stop
  paradas: Stop[]
  transporte: TipoTransporte
  resultado: RutaOptimizada | null
  rutaGeometria: [number, number][]
  loading: boolean
  error: string | null
  backendOk: boolean
  clima: ClimateInfo | null
  flyTo: { lat: number; lon: number; zoom?: number } | null

  setPuntoInicio: (stop: Stop) => void
  addParada: (stop: Stop) => void
  removeParada: (index: number) => void
  setTransporte: (t: TipoTransporte) => void
  setBackendOk: (ok: boolean) => void
  loadClima: () => Promise<void>
  optimizar: () => Promise<void>
  limpiarResultado: () => void
  clearFlyTo: () => void
  reset: () => void
}

export const useRouteStore = create<RouteStore>((set, get) => ({
  puntoInicio: INICIO_DEFAULT,
  paradas: [],
  transporte: 'AUTO',
  resultado: null,
  rutaGeometria: [],
  loading: false,
  error: null,
  backendOk: false,
  clima: null,
  flyTo: null,

  setPuntoInicio: (stop) => set({
    puntoInicio: stop,
    flyTo: { lat: stop.latitud, lon: stop.longitud, zoom: 17 },
  }),

  addParada: (stop) => set((s) => ({
    paradas: [...s.paradas, stop],
    flyTo: { lat: stop.latitud, lon: stop.longitud, zoom: 17 },
  })),

  removeParada: (index) => set((s) => ({
    paradas: s.paradas.filter((_, i) => i !== index),
    resultado: null, rutaGeometria: [],
  })),

  setTransporte: (transporte) => set({ transporte }),
  setBackendOk: (backendOk) => set({ backendOk }),
  limpiarResultado: () => set({ resultado: null, error: null, rutaGeometria: [] }),
  clearFlyTo: () => set({ flyTo: null }),

  loadClima: async () => {
    try { const clima = await getClima(); set({ clima }) }
    catch { /* silencioso */ }
  },

  optimizar: async () => {
    const { puntoInicio, paradas, transporte } = get()
    if (paradas.length === 0) {
      set({ error: 'Agrega al menos una parada antes de optimizar' })
      return
    }
    set({ loading: true, error: null, resultado: null, rutaGeometria: [] })
    try {
      const algoritmo = paradas.length <= 10
        ? 'VECINO_MAS_CERCANO'
        : paradas.length <= 30 ? 'RECOCIDO_SIMULADO' : 'OR_TOOLS'

      const result = await optimizarRuta({
        nombreRuta: `Ruta MIAA ${new Date().toLocaleTimeString()}`,
        algoritmo,
        tipoTransporte: transporte,
        horaInicioRuta: '08:00',
        puntoInicio,
        paradas,
      })

      try {
        const osrmPort = transporte === 'A_PIE' ? 5001 : 5000
        const perfil = transporte === 'A_PIE' ? 'foot' : 'driving'
        const allPoints = [puntoInicio, ...result.ordenOptimizado]
        const coords = allPoints.map(p => `${p.longitud},${p.latitud}`).join(';')
        const osrmRes = await fetch(
          `http://localhost:${osrmPort}/route/v1/${perfil}/${coords}?overview=full&geometries=geojson`
        )
        const osrmData = await osrmRes.json()
        const geometria: [number, number][] = osrmData.routes[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        )
        set({ resultado: result, rutaGeometria: geometria, loading: false })
      } catch {
        set({ resultado: result, loading: false })
      }
    } catch (e: any) {
      set({ error: e?.response?.data?.mensaje || 'Error al conectar con el backend', loading: false })
    }
  },

  reset: () => set({
    puntoInicio: INICIO_DEFAULT,
    paradas: [],
    transporte: 'AUTO',
    resultado: null,
    rutaGeometria: [],
    loading: false,
    error: null,
    flyTo: { lat: 21.8818, lon: -102.2916, zoom: 13 },
  }),

}))