import { create } from 'zustand'
import type { Stop, TipoTransporte, RutaOptimizada } from '../types/routeTypes'
import { optimizarRuta, getClima, type ClimateInfo } from '../services/api'

export const ROUTE_COLORS = [
  '#1A7FC1', '#DC2626', '#16A34A', '#D97706', '#7C3AED',
  '#DB2777', '#0D9488', '#CA8A04', '#4F46E5', '#EA580C',
]

export function colorParaIndice(i: number) {
  return ROUTE_COLORS[i % ROUTE_COLORS.length]
}

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
  retornarAlInicio: boolean
  setRetornarAlInicio: (v: boolean) => void
  resultado: RutaOptimizada | null
  segmentosVisuales: { geometria: [number, number][]; color: string }[]
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
  retornarAlInicio: false,
  setRetornarAlInicio: (retornarAlInicio) => set({ retornarAlInicio }),
  resultado: null,
  segmentosVisuales: [],
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
    resultado: null,
    segmentosVisuales: [],
  })),

  setTransporte: (transporte) => set({ transporte }),
  setBackendOk: (backendOk) => set({ backendOk }),
  limpiarResultado: () => set({ resultado: null, error: null, segmentosVisuales: [] }),
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
    set({ loading: true, error: null, resultado: null, segmentosVisuales: [] })
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
        const { retornarAlInicio } = get()
        const allPoints = [puntoInicio, ...result.ordenOptimizado]
        if (retornarAlInicio) allPoints.push(puntoInicio)

        const segmentosVisuales: { geometria: [number, number][]; color: string }[] = []

        for (let i = 0; i < allPoints.length - 1; i++) {
          const a = allPoints[i]
          const b = allPoints[i + 1]
          const coords = `${a.longitud},${a.latitud};${b.longitud},${b.latitud}`
          const osrmRes = await fetch(
            `http://localhost:${osrmPort}/route/v1/${perfil}/${coords}?overview=full&geometries=geojson`
          )
          const osrmData = await osrmRes.json()
          const geometria: [number, number][] = osrmData.routes[0].geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon]
          )
          const color = i === 0 ? '#22c55e' : colorParaIndice(i)
          segmentosVisuales.push({ geometria, color })
        }

let distanciaRetorno = 0
        if (retornarAlInicio && segmentosVisuales.length > 0) {
          const ultimo = segmentosVisuales[segmentosVisuales.length - 1]
          const coords2 = ultimo.geometria
          if (coords2.length >= 2) {
            const [lat1, lon1] = coords2[coords2.length - 1]
            const [lat2, lon2] = [puntoInicio.latitud, puntoInicio.longitud]
            const R = 6371
            const dLat = (lat2 - lat1) * Math.PI / 180
            const dLon = (lon2 - lon1) * Math.PI / 180
            distanciaRetorno = R * 2 * Math.asin(Math.sqrt(
              Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
            ))
          }
        }
        set({
          resultado: {
            ...result,
            distanciaTotalKm: result.distanciaTotalKm + distanciaRetorno,
          },
          segmentosVisuales,
          loading: false,
        })      } catch {
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
    retornarAlInicio: false,
    resultado: null,
    segmentosVisuales: [],
    loading: false,
    error: null,
    flyTo: { lat: 21.8818, lon: -102.2916, zoom: 13 },
  }),
}))