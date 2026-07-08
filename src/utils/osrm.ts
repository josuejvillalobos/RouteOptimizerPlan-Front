import type { Stop, SegmentoVisual, Alternativa, AlertaZona } from '../types/routeTypes'
import { OSRM_CONFIG } from '../constants/route'
import { coordsAGeometria, calcularTiempoSegmento, seleccionarRutaSinAlertas, factorHoraPico } from './geo'
import { colorParaIndice } from '../store/routeStore'

// ─── Tipos internos ───────────────────────────────────────────────────────────

export interface ResultadoOSRM {
  segmentosVisuales: SegmentoVisual[]
  distanciaTotal: number
  tiempoTotal: number
  alternativas: Alternativa[]
}

// ─── Fetch de un segmento individual ─────────────────────────────────────────

async function fetchSegmentoOSRM(
  a: Stop,
  b: Stop,
  port: number,
  perfil: string
): Promise<any[]> {
  const coords = `${a.longitud},${a.latitud};${b.longitud},${b.latitud}`
  const url = `http://localhost:${port}/route/v1/${perfil}/${coords}` +
    `?alternatives=${OSRM_CONFIG.ALTERNATIVES}&overview=full&geometries=geojson`

  const res  = await fetch(url)
  const data = await res.json()
  return data.routes ?? []
}

// ─── Procesamiento de alternativas ───────────────────────────────────────────

function extraerAlternativas(
  routes: any[],
  rutaSeleccionada: number
): Alternativa[] {
  return routes
    .filter((_, idx) => idx !== rutaSeleccionada)
    .map(alt => ({
      geometria:   coordsAGeometria(alt.geometry.coordinates),
      distanciaKm: alt.distance / 1000,
      tiempoMin:   Math.round(alt.duration / 60),
    }))
}

// ─── Cálculo de todos los segmentos ──────────────────────────────────────────

export async function calcularSegmentosOSRM(
  allPoints: Stop[],
  port: number,
  perfil: string,
  alertas: AlertaZona[] = []
): Promise<ResultadoOSRM> {
  const segmentosVisuales: SegmentoVisual[] = []
  const alternativas: Alternativa[] = []
  let distanciaTotal = 0
  let tiempoTotal    = 0
  const factorTotal  = factorHoraPico()

  for (let i = 0; i < allPoints.length - 1; i++) {
    const routes = await fetchSegmentoOSRM(
      allPoints[i], allPoints[i + 1], port, perfil
    )
    if (routes.length === 0) continue

    const rutaIdx = seleccionarRutaSinAlertas(routes, alertas)
    const route   = routes[rutaIdx]

    segmentosVisuales.push({
      geometria: coordsAGeometria(route.geometry.coordinates),
      color: i === 0 ? '#22c55e' : colorParaIndice(i),
    })

    distanciaTotal += route.distance / 1000
    tiempoTotal    += calcularTiempoSegmento(route, perfil, factorTotal)

    // Guardar alternativas solo del primer segmento con múltiples rutas
    if (alternativas.length === 0 && routes.length > 1) {
      alternativas.push(...extraerAlternativas(routes, rutaIdx))
    }
  }

  return { segmentosVisuales, distanciaTotal, tiempoTotal, alternativas }
}