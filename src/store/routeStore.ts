import { create } from 'zustand'
import type { Stop, TipoTransporte, RutaOptimizada, ModoOrden, SegmentoVisual, Alternativa, Posicion, AlertaZona } from '../types/routeTypes'
import type { ClimateInfo } from '../services/api'
import { getClima } from '../services/api'
import { INICIO_DEFAULT, MAPA_DEFAULT } from '../constants/route'
import { optimizar, optimizarManual } from './actions/optimizarActions'
import { recalcularDesde } from './actions/gpsActions'

// ─── Interface del store ──────────────────────────────────────────────────────

export interface RouteStore {
  // Estado de ruta
  puntoInicio:      Stop
  paradas:          Stop[]
  transporte:       TipoTransporte
  retornarAlInicio: boolean
  modoOrden:        ModoOrden
  paradasManual:    Stop[]

  // Resultado
  resultado:         RutaOptimizada | null
  segmentosVisuales: SegmentoVisual[]
  alternativas:      Alternativa[]
  alternativaActiva: number

  // UI
  loading:   boolean
  error:     string | null
  backendOk: boolean
  flyTo:     { lat: number; lon: number; zoom?: number } | null

  // Externos
  clima:         ClimateInfo | null
  alertasActivas: AlertaZona[]

  // GPS
  seguimientoActivo: boolean
  posicionActual:    Posicion | null

  // Setters simples
  setPuntoInicio:       (stop: Stop) => void
  addParada:            (stop: Stop) => void
  removeParada:         (index: number) => void
  setTransporte:        (t: TipoTransporte) => void
  setRetornarAlInicio:  (v: boolean) => void
  setModoOrden:         (modo: ModoOrden) => void
  setParadasManual:     (paradas: Stop[]) => void
  setAlternativaActiva: (i: number) => void
  setBackendOk:         (ok: boolean) => void
  setAlertasActivas:    (alertas: AlertaZona[]) => void
  setSeguimientoActivo: (v: boolean) => void
  setPosicionActual:    (pos: Posicion | null) => void
  clearFlyTo:           () => void
  limpiarResultado:     () => void
  reset:                () => void

  // Acciones async
  loadClima:       () => Promise<void>
  optimizar:       () => Promise<void>
  optimizarManual: () => Promise<void>
  recalcularDesde: (lat: number, lng: number) => Promise<void>
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

const ESTADO_INICIAL = {
  puntoInicio:       INICIO_DEFAULT as Stop,
  paradas:           [] as Stop[],
  transporte:        'AUTO' as TipoTransporte,
  retornarAlInicio:  false,
  modoOrden:         'optimizado' as ModoOrden,
  paradasManual:     [] as Stop[],
  resultado:         null as RutaOptimizada | null,
  segmentosVisuales: [] as SegmentoVisual[],
  alternativas:      [] as Alternativa[],
  alternativaActiva: 0,
  loading:           false,
  error:             null as string | null,
  backendOk:         false,
  clima:             null as ClimateInfo | null,
  alertasActivas:    [] as AlertaZona[],
  seguimientoActivo: false,
  posicionActual:    null as Posicion | null,
  flyTo:             null as { lat: number; lon: number; zoom?: number } | null,
}

// ─── Helper ───────────────────────────────────────────────────────────────────

import { ROUTE_COLORS } from '../constants/route'

export function colorParaIndice(i: number): string {
  return ROUTE_COLORS[i % ROUTE_COLORS.length]
}
// ─── Store ────────────────────────────────────────────────────────────────────

export const useRouteStore = create<RouteStore>((set, get) => ({
  ...ESTADO_INICIAL,

  // ─── Setters simples ──────────────────────────────────────────────────────
  setPuntoInicio: (stop) => set({
    puntoInicio: stop,
    flyTo: { lat: stop.latitud, lon: stop.longitud, zoom: MAPA_DEFAULT.ZOOM_FLYTO },
  }),
  addParada: (stop) => set((s) => ({
    paradas: [...s.paradas, stop],
    flyTo: { lat: stop.latitud, lon: stop.longitud, zoom: MAPA_DEFAULT.ZOOM_FLYTO },
  })),
  removeParada: (index) => set((s) => ({
    paradas:           s.paradas.filter((_, i) => i !== index),
    resultado:         null,
    segmentosVisuales: [],
  })),
  setTransporte:        (transporte)        => set({ transporte }),
  setRetornarAlInicio:  (retornarAlInicio)  => set({ retornarAlInicio }),
  setModoOrden:         (modoOrden)         => set({ modoOrden }),
  setParadasManual:     (paradasManual)     => set({ paradasManual }),
  setAlternativaActiva: (alternativaActiva) => set({ alternativaActiva }),
  setBackendOk:         (backendOk)         => set({ backendOk }),
  setAlertasActivas:    (alertasActivas)    => set({ alertasActivas }),
  setSeguimientoActivo: (seguimientoActivo) => set({ seguimientoActivo }),
  setPosicionActual:    (posicionActual)    => set({ posicionActual }),
  clearFlyTo:           ()                  => set({ flyTo: null }),
  limpiarResultado: () => set({
    resultado:         null,
    error:             null,
    segmentosVisuales: [],
    alternativas:      [],
    alternativaActiva: 0,
  }),
  reset: () => set({
    ...ESTADO_INICIAL,
    flyTo: { lat: MAPA_DEFAULT.CENTER[0], lon: MAPA_DEFAULT.CENTER[1], zoom: MAPA_DEFAULT.ZOOM_RESET },
  }),

  // ─── Acciones async ───────────────────────────────────────────────────────
  loadClima: async () => {
    try { set({ clima: await getClima() }) } catch { /* silencioso */ }
  },
  optimizar:       () => optimizar(set, get),
  optimizarManual: () => optimizarManual(set, get),
  recalcularDesde: (lat, lng) => recalcularDesde(set, get, lat, lng),
}))