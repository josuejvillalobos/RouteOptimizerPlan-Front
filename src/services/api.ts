import axios from 'axios'
import type { OptimizarRequest, RutaOptimizada } from '../types/routeTypes'

const BASE_URL = 'http://localhost:8080/api/v1'
let token: string | null = null

async function getToken(): Promise<string> {
  if (token) return token
  const res = await axios.get(`${BASE_URL}/dev-token`)
  token = res.data.token
  return token!
}

export async function optimizarRuta(req: OptimizarRequest): Promise<RutaOptimizada> {
  await getToken()
  const res = await axios.post(`${BASE_URL}/rutas/optimizar`, req, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function pingBackend(): Promise<boolean> {
  try { await axios.get(`${BASE_URL}/ping`); return true }
  catch { return false }
}

export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  category: string
}

export async function buscarDirecciones(query: string): Promise<NominatimResult[]> {
  if (query.length < 2) return []
  const res = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: query,
      format: 'json',
      limit: 10,
      addressdetails: 1,
      extratags: 1,
      namedetails: 1,
      countrycodes: 'mx',
      viewbox: '-102.50,22.20,-101.90,21.60',
      bounded: 0,
      'accept-language': 'es',
    },
    headers: {},
  })
  
  const data: NominatimResult[] = res.data
  // Filtrar estrictamente solo Aguascalientes
  return data.filter(inAgs)
  }

function inAgs(r: NominatimResult) {
  const lat = parseFloat(r.lat), lon = parseFloat(r.lon)
  return lat >= 21.60 && lat <= 22.20 && lon >= -102.50 && lon <= -101.90
}

export interface ClimateInfo {
  temperatura: number
  descripcion: string
  factor: number
  lluvia: number
  viento: number
}

export async function getClima(): Promise<ClimateInfo> {
  // timezone=America/Mexico_City para obtener la hora local correcta
  const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: 21.8818,
      longitude: -102.2916,
      current: 'temperature_2m,precipitation,windspeed_10m,weathercode',
      timezone: 'America/Mexico_City',
      forecast_days: 1,
    },
  })
  const c = res.data.current
  const code: number = c.weathercode
  let descripcion = 'Despejado'
  let factor = 1.0
  if (code >= 95) { descripcion = 'Tormenta'; factor = 1.4 }
  else if (code >= 80) { descripcion = 'Chubascos'; factor = 1.25 }
  else if (code >= 71) { descripcion = 'Nevada'; factor = 1.5 }
  else if (code >= 51) { descripcion = 'Lluvia'; factor = 1.3 }
  else if (code >= 45) { descripcion = 'Neblina'; factor = 1.1 }
  else if (code >= 2) { descripcion = 'Nublado'; factor = 1.0 }
  return {
    temperatura: Math.round(c.temperature_2m),
    descripcion,
    factor,
    lluvia: c.precipitation,
    viento: Math.round(c.windspeed_10m),
  }
}

export async function geocodificarInverso(lat: number, lon: number): Promise<string> {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json', 'accept-language': 'es' },
      headers: {},
    })
    const d = res.data.address
    const nombre = d.road || d.pedestrian || d.path || d.neighbourhood || 'Ubicacion seleccionada'
    const colonia = d.suburb || d.neighbourhood || d.city_district || ''
    return colonia ? `${nombre}, ${colonia}` : nombre
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  }
}