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
  modoOrden: 'optimizado' | 'manual'
  paradasManual: Stop[]
  resultado: RutaOptimizada | null
  segmentosVisuales: { geometria: [number, number][]; color: string }[]
  alternativas: { geometria: [number, number][]; distanciaKm: number; tiempoMin: number }[]
  alternativaActiva: number
  setAlternativaActiva: (i: number) => void
  loading: boolean
  error: string | null
  backendOk: boolean
  clima: ClimateInfo | null
  alertasActivas: { latitud: number; longitud: number; tipo: string }[]
  setAlertasActivas: (alertas: { latitud: number; longitud: number; tipo: string }[]) => void
  flyTo: { lat: number; lon: number; zoom?: number } | null
  setPuntoInicio: (stop: Stop) => void
  addParada: (stop: Stop) => void
  removeParada: (index: number) => void
  setTransporte: (t: TipoTransporte) => void
  setRetornarAlInicio: (v: boolean) => void
  setModoOrden: (modo: 'optimizado' | 'manual') => void
  setParadasManual: (paradas: Stop[]) => void
  setBackendOk: (ok: boolean) => void
  loadClima: () => Promise<void>
  optimizar: () => Promise<void>
  optimizarManual: () => Promise<void>
  limpiarResultado: () => void
  clearFlyTo: () => void
  reset: () => void
}

async function calcularSegmentosOSRM(
  allPoints: Stop[],
  osrmPort: number,
  perfil: string,
  alertas: { latitud: number; longitud: number }[] = []
): Promise<{
  segmentosVisuales: { geometria: [number, number][]; color: string }[]
  distanciaTotal: number
  tiempoTotal: number
  alternativas: { geometria: [number, number][]; distanciaKm: number; tiempoMin: number }[]
}> {
  const segmentosVisuales: { geometria: [number, number][]; color: string }[] = []
  const alternativas: { geometria: [number, number][]; distanciaKm: number; tiempoMin: number }[] = []
  let distanciaTotal = 0
  let tiempoTotal = 0

  for (let i = 0; i < allPoints.length - 1; i++) {
    const a = allPoints[i]
    const b = allPoints[i + 1]
    const coords = `${a.longitud},${a.latitud};${b.longitud},${b.latitud}`
    const url = `http://localhost:${osrmPort}/route/v1/${perfil}/${coords}?alternatives=3&overview=full&geometries=geojson`

    const osrmRes = await fetch(url)
    const osrmData = await osrmRes.json()
    const routes = osrmData.routes

    if (!routes || routes.length === 0) continue

    // Seleccionar ruta que evite alertas activas
    let rutaSeleccionada = 0
    if (alertas.length > 0 && routes.length > 1) {
      let menorConflictos = Infinity
      routes.forEach((r: any, idx: number) => {
        const geom: [number, number][] = r.geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        )
        const conflictos = alertas.filter(alerta =>
          geom.some(([lat, lon]) =>
            Math.abs(lat - alerta.latitud) < 0.003 && Math.abs(lon - alerta.longitud) < 0.003
          )
        ).length
        if (conflictos < menorConflictos) {
          menorConflictos = conflictos
          rutaSeleccionada = idx
        }
      })
      if (rutaSeleccionada > 0) {
        console.log(`Segmento ${i}: evitando alerta — usando ruta alternativa ${rutaSeleccionada}`)
      }
    }

    const route = routes[rutaSeleccionada]
    const geometria: [number, number][] = route.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    )
    const color = i === 0 ? '#22c55e' : colorParaIndice(i)
    segmentosVisuales.push({ geometria, color })
    distanciaTotal += route.distance / 1000
    tiempoTotal += Math.round(route.duration / 60)

    // Guardar alternativas del primer segmento con múltiples rutas
    if (alternativas.length === 0 && routes.length > 1) {
      routes.forEach((alt: any, idx: number) => {
        if (idx === rutaSeleccionada) return // no duplicar la seleccionada
        const geomAlt: [number, number][] = alt.geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        )
        alternativas.push({
          geometria: geomAlt,
          distanciaKm: alt.distance / 1000,
          tiempoMin: Math.round(alt.duration / 60),
        })
      })
    }
  }

  return { segmentosVisuales, distanciaTotal, tiempoTotal, alternativas }
}

export const useRouteStore = create<RouteStore>((set, get) => ({
  puntoInicio: INICIO_DEFAULT,
  paradas: [],
  transporte: 'AUTO',
  retornarAlInicio: false,
  modoOrden: 'optimizado',
  paradasManual: [],
  resultado: null,
  segmentosVisuales: [],
  alternativas: [],
  alternativaActiva: 0,
  setAlternativaActiva: (alternativaActiva) => set({ alternativaActiva }),
  loading: false,
  error: null,
  backendOk: false,
  clima: null,
  alertasActivas: [],
  setAlertasActivas: (alertasActivas) => set({ alertasActivas }),
  flyTo: null,

  setPuntoInicio: (stop) => set({ puntoInicio: stop, flyTo: { lat: stop.latitud, lon: stop.longitud, zoom: 17 } }),
  addParada: (stop) => set((s) => ({ paradas: [...s.paradas, stop], flyTo: { lat: stop.latitud, lon: stop.longitud, zoom: 17 } })),
  removeParada: (index) => set((s) => ({ paradas: s.paradas.filter((_, i) => i !== index), resultado: null, segmentosVisuales: [] })),
  setTransporte: (transporte) => set({ transporte }),
  setRetornarAlInicio: (retornarAlInicio) => set({ retornarAlInicio }),
  setModoOrden: (modoOrden) => set({ modoOrden }),
  setParadasManual: (paradasManual) => set({ paradasManual }),
  setBackendOk: (backendOk) => set({ backendOk }),
  limpiarResultado: () => set({ resultado: null, error: null, segmentosVisuales: [], alternativas: [], alternativaActiva: 0 }),
  clearFlyTo: () => set({ flyTo: null }),

  loadClima: async () => {
    try { const clima = await getClima(); set({ clima }) }
    catch { /* silencioso */ }
  },

  optimizar: async () => {
    const { puntoInicio, paradas, transporte, retornarAlInicio } = get()
    if (paradas.length === 0) { set({ error: 'Agrega al menos una parada antes de optimizar' }); return }
    set({ loading: true, error: null, resultado: null, segmentosVisuales: [] })
    try {
      const algoritmo = paradas.length <= 10 ? 'VECINO_MAS_CERCANO' : paradas.length <= 30 ? 'RECOCIDO_SIMULADO' : 'OR_TOOLS'
      const result = await optimizarRuta({
        nombreRuta: `Ruta MIAA ${new Date().toLocaleTimeString()}`,
        algoritmo, tipoTransporte: transporte, horaInicioRuta: '08:00', puntoInicio, paradas,
      })
      try {
        const osrmPort = transporte === 'A_PIE' ? 5001 : 5000
        const perfil = transporte === 'A_PIE' ? 'foot' : 'driving'
        const ordenSinInicio = result.ordenOptimizado.filter(
          p => !(Math.abs(p.latitud - puntoInicio.latitud) < 0.0001 && Math.abs(p.longitud - puntoInicio.longitud) < 0.0001)
        )
        const allPoints = [puntoInicio, ...ordenSinInicio]
        if (retornarAlInicio) allPoints.push(puntoInicio)
        const { segmentosVisuales, distanciaTotal, alternativas } = await calcularSegmentosOSRM(
          allPoints, osrmPort, perfil, get().alertasActivas
        )
        set({
          resultado: { ...result, distanciaTotalKm: distanciaTotal },
          segmentosVisuales, alternativas, alternativaActiva: 0, loading: false,
        })
      } catch (err) {
        console.error('Error en OSRM:', err)
        set({ resultado: result, loading: false })
      }
    } catch (e: any) {
      set({ error: e?.response?.data?.mensaje || 'Error al conectar con el backend', loading: false })
    }
  },

  optimizarManual: async () => {
    const { puntoInicio, paradasManual, transporte, retornarAlInicio } = get()
    if (paradasManual.length === 0) { set({ error: 'Ordena las paradas antes de calcular' }); return }
    set({ loading: true, error: null, resultado: null, segmentosVisuales: [] })
    try {
      const osrmPort = transporte === 'A_PIE' ? 5001 : 5000
      const perfil = transporte === 'A_PIE' ? 'foot' : 'driving'
      const allPoints = [puntoInicio, ...paradasManual]
      if (retornarAlInicio) allPoints.push(puntoInicio)
      const { segmentosVisuales, distanciaTotal, tiempoTotal } = await calcularSegmentosOSRM(
        allPoints, osrmPort, perfil, get().alertasActivas
      )
      const resultadoManual: RutaOptimizada = {
        id: 'manual-' + Date.now(),
        nombreRuta: `Ruta Manual ${new Date().toLocaleTimeString()}`,
        distanciaTotalKm: distanciaTotal,
        tiempoEstimadoMin: tiempoTotal,
        algoritmoUsado: 'ORDEN_MANUAL',
        tipoTransporte: transporte,
        ordenOptimizado: paradasManual,
        segmentos: paradasManual.map((p, i) => ({
          orden: i + 1,
          origen: i === 0 ? puntoInicio : paradasManual[i - 1],
          destino: p,
          distanciaKm: 0,
          tiempoEstimadoMin: 0,
        })),
      }
      set({ resultado: resultadoManual, segmentosVisuales, loading: false })
    } catch {
      set({ error: 'Error al calcular ruta manual — verifica que OSRM este corriendo', loading: false })
    }
  },

  reset: () => set({
    puntoInicio: INICIO_DEFAULT,
    paradas: [], transporte: 'AUTO', retornarAlInicio: false,
    modoOrden: 'optimizado', paradasManual: [],
    resultado: null, segmentosVisuales: [], alternativas: [],
    alternativaActiva: 0, loading: false, error: null,
    flyTo: { lat: 21.8818, lon: -102.2916, zoom: 13 },
  }),
}))