// ─── Colores de ruta ──────────────────────────────────────────────────────────
export const ROUTE_COLORS = [
  '#1A7FC1', '#DC2626', '#16A34A', '#D97706', '#7C3AED',
  '#DB2777', '#0D9488', '#CA8A04', '#4F46E5', '#EA580C',
] as const

// ─── Punto de inicio por defecto ──────────────────────────────────────────────
export const INICIO_DEFAULT = {
  etiqueta: 'Almacen MIAA — Plaza Patria',
  calle: 'Plaza de la Patria, Centro, Aguascalientes',
  latitud: 21.8805,
  longitud: -102.2963,
} as const

// ─── Configuración OSRM ───────────────────────────────────────────────────────
export const OSRM_CONFIG = {
  DRIVING_PORT: 5000,
  FOOT_PORT: 5001,
  ALTERNATIVES: 3,
  UMBRAL_DESVIACION_METROS: 50,
  COOLDOWN_RECALCULO_MS: 30_000,
} as const

// ─── Factor de velocidad peatonal ─────────────────────────────────────────────
export const VELOCIDAD_PIE_MIN_POR_KM = 12 // 5 km/h

// ─── Algoritmos disponibles ───────────────────────────────────────────────────
export const ALGORITMOS = {
  VECINO: 'VECINO_MAS_CERCANO',
  SA: 'RECOCIDO_SIMULADO',
  OR_TOOLS: 'OR_TOOLS',
} as const

// ─── Vista por defecto del mapa ───────────────────────────────────────────────
export const MAPA_DEFAULT = {
  CENTER: [21.8818, -102.2916] as [number, number],
  ZOOM: 15,
  ZOOM_RESET: 13,
  ZOOM_FLYTO: 17,
} as const