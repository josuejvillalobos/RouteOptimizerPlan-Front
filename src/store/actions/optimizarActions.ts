import type { StoreApi } from 'zustand'
import type { RouteStore } from '../routeStore'
import type { AlgoritmoTipo } from '../../types/routeTypes'
import { optimizarRuta, iniciarRutaML } from '../../services/api'
import { calcularSegmentosOSRM } from '../../utils/osrm'
import { osrmConfig, seleccionarAlgoritmo, filtrarPuntoInicio, nombreRutaConTimestamp } from '../../utils/routing'
import { factorHoraPico } from '../../utils/geo'

type Set = StoreApi<RouteStore>['setState']
type Get = StoreApi<RouteStore>['getState']

// ─── Helper para registrar ruta en ML ────────────────────────────────────────

function registrarInicioML(
  get: Get,
  algoritmoUsado: string,
  transporte: string,
  numParadas: number,
  distanciaKm: number,
  tiempoMin: number,
  factorClimatico?: number,
  condicionClimatica?: string,
) {
  iniciarRutaML({
    algoritmoUsado,
    tipoTransporte:         transporte,
    numParadas,
    distanciaPlanificadaKm: distanciaKm,
    tiempoPlanificadoMin:   tiempoMin,
    factorClimatico,
    condicionClimatica,
    temperatura:            get().clima?.temperatura,
    factorHoraPico:         factorHoraPico(),
    alertasActivas:         get().alertasActivas.length,
  }).then(({ id }) => {
    if (id) get().setRutaMLId(id)
  })
}

// ─── Optimizar con algoritmo TSP ─────────────────────────────────────────────

export async function optimizar(set: Set, get: Get): Promise<void> {
  const { puntoInicio, paradas, transporte, retornarAlInicio } = get()

  if (paradas.length === 0) {
    set({ error: 'Agrega al menos una parada antes de optimizar' })
    return
  }

  set({ loading: true, error: null, resultado: null, segmentosVisuales: [] })

  try {
    const result = await optimizarRuta({
      nombreRuta:     nombreRutaConTimestamp('Ruta MIAA'),
      algoritmo:      seleccionarAlgoritmo(paradas.length) as AlgoritmoTipo,
      tipoTransporte: transporte,
      horaInicioRuta: '08:00',
      puntoInicio,
      paradas,
    })

    try {
      const { port, perfil } = osrmConfig(transporte)
      const ordenSinInicio   = filtrarPuntoInicio(puntoInicio, result.ordenOptimizado)
      const allPoints        = [puntoInicio, ...ordenSinInicio]
      if (retornarAlInicio) allPoints.push(puntoInicio)

      const { segmentosVisuales, distanciaTotal, alternativas } =
        await calcularSegmentosOSRM(allPoints, port, perfil, get().alertasActivas)

      set({
        resultado: { ...result, distanciaTotalKm: distanciaTotal },
        segmentosVisuales,
        alternativas,
        alternativaActiva: 0,
        loading: false,
      })

      // Registrar con distancia real de OSRM
      registrarInicioML(
        get,
        result.algoritmoUsado,
        transporte,
        paradas.length,
        distanciaTotal,
        result.tiempoEstimadoMin,
        result.factorClimatico,
        result.condicionClimatica,
      )

    } catch {
      set({ resultado: result, loading: false })

      // Registrar con datos del backend aunque OSRM falle
      registrarInicioML(
        get,
        result.algoritmoUsado,
        transporte,
        paradas.length,
        result.distanciaTotalKm,
        result.tiempoEstimadoMin,
        result.factorClimatico,
        result.condicionClimatica,
      )
    }

  } catch (e: any) {
    set({
      error: e?.response?.data?.mensaje ?? 'Error al conectar con el backend',
      loading: false,
    })
  }
}

// ─── Optimizar en orden manual ────────────────────────────────────────────────

export async function optimizarManual(set: Set, get: Get): Promise<void> {
  const { puntoInicio, paradasManual, transporte, retornarAlInicio } = get()

  if (paradasManual.length === 0) {
    set({ error: 'Ordena las paradas antes de calcular' })
    return
  }

  set({ loading: true, error: null, resultado: null, segmentosVisuales: [] })

  try {
    const { port, perfil } = osrmConfig(transporte)
    const allPoints        = [puntoInicio, ...paradasManual]
    if (retornarAlInicio) allPoints.push(puntoInicio)

    const { segmentosVisuales, distanciaTotal, tiempoTotal } =
      await calcularSegmentosOSRM(allPoints, port, perfil, get().alertasActivas)

    const resultadoManual = {
      id:               `manual-${Date.now()}`,
      nombreRuta:       nombreRutaConTimestamp('Ruta Manual'),
      distanciaTotalKm: distanciaTotal,
      tiempoEstimadoMin: tiempoTotal,
      algoritmoUsado:   'ORDEN_MANUAL',
      tipoTransporte:   transporte,
      ordenOptimizado:  paradasManual,
      segmentos: paradasManual.map((p, i) => ({
        orden:            i + 1,
        origen:           i === 0 ? puntoInicio : paradasManual[i - 1],
        destino:          p,
        distanciaKm:      0,
        tiempoEstimadoMin: 0,
      })),
    }

    set({ resultado: resultadoManual, segmentosVisuales, loading: false })

    // Registrar para ML
    registrarInicioML(
      get,
      'ORDEN_MANUAL',
      transporte,
      paradasManual.length,
      distanciaTotal,
      tiempoTotal,
    )

  } catch {
    set({ error: 'Error al calcular ruta manual — verifica que OSRM esté corriendo', loading: false })
  }
}