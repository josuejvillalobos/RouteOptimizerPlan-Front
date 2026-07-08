import type { Stop, TipoTransporte, OsrmPerfil } from '../types/routeTypes'
import { OSRM_CONFIG, ALGORITMOS } from '../constants/route'

// ─── Configuración OSRM por tipo de transporte ────────────────────────────────

export function osrmConfig(transporte: TipoTransporte): OsrmPerfil {
  return transporte === 'A_PIE'
    ? { port: OSRM_CONFIG.FOOT_PORT,    perfil: 'foot'    }
    : { port: OSRM_CONFIG.DRIVING_PORT, perfil: 'driving' }
}

// ─── Selección de algoritmo según número de paradas ──────────────────────────

export function seleccionarAlgoritmo(n: number): string {
  if (n <= 10) return ALGORITMOS.VECINO
  if (n <= 30) return ALGORITMOS.SA
  return ALGORITMOS.OR_TOOLS
}

// ─── Filtrar punto de inicio del orden optimizado ────────────────────────────

export function filtrarPuntoInicio(
  puntoInicio: Stop,
  ordenOptimizado: Stop[]
): Stop[] {
  return ordenOptimizado.filter(
    p => !(
      Math.abs(p.latitud  - puntoInicio.latitud)  < 0.0001 &&
      Math.abs(p.longitud - puntoInicio.longitud) < 0.0001
    )
  )
}

// ─── Nombre de ruta con timestamp ─────────────────────────────────────────────

export function nombreRutaConTimestamp(prefijo: string): string {
  return `${prefijo} ${new Date().toLocaleTimeString()}`
}

// ─── Hora actual formateada HH:MM ─────────────────────────────────────────────

export function horaActual(): string {
  return new Date().toTimeString().slice(0, 5)
}