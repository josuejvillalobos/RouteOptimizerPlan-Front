import axios from 'axios'
import type { OptimizarRequest, RutaOptimizada } from '../types/routeTypes'

const BASE_URL = 'http://localhost:8080/api/v1'
const API_KEY = 'miaa-secret-key-2026' // TEMPORAL — mover a variable de entorno del front (.env / VITE_API_KEY)

let token: string | null = null

// Instancia dedicada al backend propio, con X-API-Key siempre incluido.
// Nominatim/Open-Meteo NO deben usar esta instancia (no la necesitan y no la esperan).
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-API-Key': API_KEY },
})

async function getToken(): Promise<string> {
  if (token) return token
  const res = await api.get('/dev-token')
  token = res.data.token
  return token!
}

// ─── Ruta ─────────────────────────────────────────────────────────────────────

export async function optimizarRuta(req: OptimizarRequest): Promise<RutaOptimizada> {
  await getToken()
  const res = await api.post('/rutas/optimizar', req, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function pingBackend(): Promise<boolean> {
  try { await api.get('/ping'); return true }
  catch { return false }
}

// ─── Nominatim ────────────────────────────────────────────────────────────────
// Servicio externo (OpenStreetMap) — usa axios normal, NO la instancia `api`.
// No debe llevar X-API-Key ni Authorization: son headers de nuestro backend, no de Nominatim.

export interface NominatimResult {
  place_id:    number
  display_name: string
  lat:         string
  lon:         string
  type:        string
  category:    string
  address?: {
    house_number?:  string
    road?:          string
    pedestrian?:    string
    neighbourhood?: string
    suburb?:        string
    city_district?: string
    postcode?:      string
    shop?:          string
    amenity?:       string
    building?:      string
    office?:        string
  }
  namedetails?: {
    name?:    string
    'name:es'?: string
  }
}

export async function buscarDirecciones(query: string): Promise<NominatimResult[]> {
  if (query.length < 2) return []
  const res = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q:                query,
      format:           'json',
      limit:            10,
      addressdetails:   1,
      extratags:        1,
      namedetails:      1,
      countrycodes:     'mx',
      viewbox:          '-102.50,22.20,-101.90,21.60',
      bounded:          1,
      'accept-language': 'es',
    },
    headers: {},
  })
  const data: NominatimResult[] = res.data
  return data.filter(inAgs)
}

function inAgs(r: NominatimResult) {
  const lat = parseFloat(r.lat), lon = parseFloat(r.lon)
  return lat >= 21.60 && lat <= 22.20 && lon >= -102.50 && lon <= -101.90
}

// ─── Clima ────────────────────────────────────────────────────────────────────
// Servicio externo (Open-Meteo) — axios normal, mismo motivo que Nominatim.

export interface ClimateInfo {
  temperatura: number
  descripcion: string
  factor:      number
  lluvia:      number
  viento:      number
}

export async function getClima(): Promise<ClimateInfo> {
  const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude:     21.8818,
      longitude:    -102.2916,
      current:      'temperature_2m,apparent_temperature,precipitation,windspeed_10m,weathercode,relativehumidity_2m',
      timezone:     'America/Mexico_City',
      forecast_days: 1,
    },
  })

  const c    = res.data.current
  const code = c.weathercode as number

  let descripcion = 'Despejado'
  let factor      = 1.0

  if      (code === 0)               { descripcion = 'Despejado';    factor = 1.0  }
  else if (code <= 2)                { descripcion = 'Poco nublado'; factor = 1.0  }
  else if (code === 3)               { descripcion = 'Nublado';      factor = 1.0  }
  else if (code >= 45 && code <= 48) { descripcion = 'Neblina';      factor = 1.1  }
  else if (code >= 51 && code <= 55) { descripcion = 'Llovizna';     factor = 1.15 }
  else if (code >= 61 && code <= 65) { descripcion = 'Lluvia';       factor = 1.3  }
  else if (code >= 71 && code <= 77) { descripcion = 'Nevada';       factor = 1.5  }
  else if (code >= 80 && code <= 82) { descripcion = 'Chubascos';    factor = 1.25 }
  else if (code >= 95 && code <= 99) { descripcion = 'Tormenta';     factor = 1.4  }

  return {
    temperatura: Math.round(c.temperature_2m),
    descripcion,
    factor,
    lluvia:  c.precipitation,
    viento:  Math.round(c.windspeed_10m),
  }
}

// ─── Geocodificación inversa ──────────────────────────────────────────────────
// Servicio externo (Nominatim reverse) — axios normal, mismo motivo.

export async function geocodificarInverso(lat: number, lon: number): Promise<string> {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json', 'accept-language': 'es' },
      headers: {},
    })
    const d       = res.data.address
    const nombre  = d.road || d.pedestrian || d.path || d.neighbourhood || 'Ubicacion seleccionada'
    const colonia = d.suburb || d.neighbourhood || d.city_district || ''
    return colonia ? `${nombre}, ${colonia}` : nombre
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  }
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

export interface Alert {
  id:            string
  tipo:          string
  descripcion?:  string
  latitud:       number
  longitud:      number
  usuarioId:     string
  creadoEn:      string
  expiraEn:      string
  activa:        boolean
  vecesReportada: number
}

export async function getAlertasActivas(): Promise<Alert[]> {
  await getToken()
  const res = await api.get('/alertas/activas', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function crearAlerta(data: {
  tipo:         string
  descripcion?: string
  latitud:      number
  longitud:     number
}): Promise<Alert> {
  await getToken()
  const res = await api.post('/alertas', data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function resolverAlerta(id: string): Promise<void> {
  await getToken()
  await api.patch(`/alertas/${id}/resolver`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ─── ML — Domicilios aprendizaje ──────────────────────────────────────────────

export async function registrarDomicilioAprendizaje(data: {
  busqueda:  string
  latitud:   number
  longitud:  number
  etiqueta?: string
  fuente:    'MAPA_CLICK' | 'GEOCODING_FALLBACK'
}): Promise<void> {
  try {
    await getToken()
    await api.post('/ml/domicilios', data, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch { /* silencioso */ }
}

// ─── ML — Historial de rutas ──────────────────────────────────────────────────

export async function iniciarRutaML(data: {
  algoritmoUsado:         string
  tipoTransporte:         string
  numParadas:             number
  distanciaPlanificadaKm: number
  tiempoPlanificadoMin:   number
  factorClimatico?:       number
  condicionClimatica?:    string
  temperatura?:           number
  factorHoraPico?:        number
  alertasActivas?:        number
}): Promise<{ id: string }> {
  try {
    await getToken()
    const res = await api.post('/ml/rutas/iniciar', data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch { return { id: '' } }
}

export async function completarRutaML(id: string, data: {
  tiempoRealMin: number
  recalculos:    number
}): Promise<void> {
  try {
    if (!id) return
    await getToken()
    await api.patch(`/ml/rutas/${id}/completar`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch { /* silencioso */ }
}