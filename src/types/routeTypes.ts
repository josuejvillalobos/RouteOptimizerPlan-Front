export type AlgoritmoTipo = 'VECINO_MAS_CERCANO' | 'RECOCIDO_SIMULADO' | 'OR_TOOLS'
export type TipoTransporte = 'AUTO' | 'A_PIE'
export type ModoOrden = 'optimizado' | 'manual'

// ─── Geo ──────────────────────────────────────────────────────────────────────

export interface Posicion {
  lat: number
  lng: number
}

export interface AlertaZona {
  latitud: number
  longitud: number
  tipo?: string
}

export type Geometria = [number, number][] // [lat, lon][]

// ─── Parada / Stop ────────────────────────────────────────────────────────────

export interface Stop {
  etiqueta: string
  calle: string
  latitud: number
  longitud: number
  ventanaInicio?: string
  ventanaFin?: string
  tiempoServicioMin?: number
}

// ─── Ruta ─────────────────────────────────────────────────────────────────────

export interface OptimizarRequest {
  nombreRuta: string
  algoritmo: AlgoritmoTipo
  tipoTransporte: TipoTransporte
  horaInicioRuta: string
  puntoInicio: Stop
  paradas: Stop[]
}

export interface SegmentoRuta {
  orden: number
  origen: Stop
  destino: Stop
  distanciaKm: number
  tiempoEstimadoMin: number
  horaLlegadaEstimada?: string
}

export interface RutaOptimizada {
  id: string
  nombreRuta: string
  distanciaTotalKm: number
  tiempoEstimadoMin: number
  algoritmoUsado: string
  tipoTransporte: TipoTransporte
  ordenOptimizado: Stop[]
  segmentos: SegmentoRuta[]
  factorClimatico?: number
  condicionClimatica?: string
}

// ─── Visualización ────────────────────────────────────────────────────────────

export interface SegmentoVisual {
  geometria: Geometria
  color: string
}

export interface Alternativa {
  geometria: Geometria
  distanciaKm: number
  tiempoMin: number
}

// ─── OSRM ─────────────────────────────────────────────────────────────────────

export interface OsrmPerfil {
  port: number
  perfil: string
}