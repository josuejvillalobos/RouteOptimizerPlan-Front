import type { StoreApi } from 'zustand'
import type { RouteStore } from '../routeStore'
import type { Stop } from '../../types/routeTypes'
import { optimizarRuta } from '../../services/api'
import { calcularSegmentosOSRM } from '../../utils/osrm'
import { osrmConfig, seleccionarAlgoritmo, filtrarPuntoInicio, nombreRutaConTimestamp, horaActual } from '../../utils/routing'

type Set = StoreApi<RouteStore>['setState']
type Get = StoreApi<RouteStore>['getState']

// ─── Recalcular ruta desde posición actual (GPS) ──────────────────────────────

export async function recalcularDesde(
  set: Set,
  get: Get,
  lat: number,
  lng: number
): Promise<void> {
  const { paradas, transporte, retornarAlInicio, alertasActivas } = get()
  if (paradas.length === 0) return

  const nuevoPuntoInicio: Stop = {
    etiqueta: 'Posición actual',
    calle:    `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    latitud:  lat,
    longitud: lng,
  }

  set({ loading: true, error: null })

  try {
    const result = await optimizarRuta({
      nombreRuta:     nombreRutaConTimestamp('Ruta MIAA'),
      algoritmo:      seleccionarAlgoritmo(paradas.length) as any,
      tipoTransporte: transporte,
      horaInicioRuta: horaActual(),
      puntoInicio:    nuevoPuntoInicio,
      paradas,
    })

    const { port, perfil } = osrmConfig(transporte)
    const ordenSinInicio   = filtrarPuntoInicio(nuevoPuntoInicio, result.ordenOptimizado)
    const allPoints        = [nuevoPuntoInicio, ...ordenSinInicio]
    if (retornarAlInicio) allPoints.push(get().puntoInicio)

    const { segmentosVisuales, distanciaTotal, alternativas } =
      await calcularSegmentosOSRM(allPoints, port, perfil, alertasActivas)

    set({
      puntoInicio:      nuevoPuntoInicio,
      resultado:        { ...result, distanciaTotalKm: distanciaTotal },
      segmentosVisuales,
      alternativas,
      alternativaActiva: 0,
      loading:          false,
    })
  } catch {
    set({ loading: false })
  }
}