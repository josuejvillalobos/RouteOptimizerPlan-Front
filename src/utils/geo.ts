import { VELOCIDAD_PIE_MIN_POR_KM } from '../constants/route'
import type { AlertaZona, Geometria } from '../types/routeTypes'

// ─── Factor de tráfico por hora del día ──────────────────────────────────────

export function factorHoraPico(): number {
  const h = new Date().getHours()
  if (h >= 7  && h < 9)  return 1.40  // Hora pico mañana
  if (h >= 13 && h < 15) return 1.30  // Hora pico comida
  if (h >= 18 && h < 20) return 1.35  // Hora pico tarde
  if (h >= 6  && h < 7)  return 1.10  // Tráfico ligero mañana
  if (h >= 15 && h < 18) return 1.10  // Tráfico moderado tarde
  if (h >= 20 && h < 22) return 1.10  // Tráfico ligero noche
  if (h >= 22 || h < 6)  return 0.90  // Madrugada libre
  return 1.0
}

// ─── Tiempo estimado por segmento ─────────────────────────────────────────────

export function calcularTiempoSegmento(
  route: any,
  perfil: string,
  factorTotal: number
): number {
  if (perfil === 'foot') {
    return Math.round((route.distance / 1000) * VELOCIDAD_PIE_MIN_POR_KM * factorTotal)
  }
  return Math.round((route.duration / 60) * factorTotal)
}

// ─── Conversión de coordenadas OSRM → Leaflet ─────────────────────────────────

export function coordsAGeometria(coordinates: [number, number][]): Geometria {
  return coordinates.map(([lon, lat]) => [lat, lon])
}

// ─── Distancia de un punto a un segmento de ruta ─────────────────────────────

export function distanciaAPuntoRuta(
  lat: number,
  lng: number,
  segmento: Geometria
): number {
  let minDist = Infinity

  for (let i = 0; i < segmento.length - 1; i++) {
    const [lat1, lon1] = segmento[i]
    const [lat2, lon2] = segmento[i + 1]

    const A = lat - lat1
    const B = lng - lon1
    const C = lat2 - lat1
    const D = lon2 - lon1

    const dot   = A * C + B * D
    const lenSq = C * C + D * D
    const t     = lenSq !== 0 ? Math.max(0, Math.min(1, dot / lenSq)) : 0

    const dx = lat - (lat1 + t * C)
    const dy = lng - (lon1 + t * D)

    const dist = Math.sqrt(dx * dx + dy * dy) * 111_000 // grados → metros
    if (dist < minDist) minDist = dist
  }

  return minDist
}

// ─── Selección de ruta que evite alertas ─────────────────────────────────────

export function seleccionarRutaSinAlertas(
  routes: any[],
  alertas: AlertaZona[]
): number {
  if (alertas.length === 0 || routes.length <= 1) return 0

  let rutaSeleccionada = 0
  let menorConflictos  = Infinity

  routes.forEach((r, idx) => {
    const geom = coordsAGeometria(r.geometry.coordinates)
    const conflictos = alertas.filter(alerta =>
      geom.some(([lat, lon]) =>
        Math.abs(lat - alerta.latitud)  < 0.003 &&
        Math.abs(lon - alerta.longitud) < 0.003
      )
    ).length

    if (conflictos < menorConflictos) {
      menorConflictos  = conflictos
      rutaSeleccionada = idx
    }
  })

  return rutaSeleccionada
}