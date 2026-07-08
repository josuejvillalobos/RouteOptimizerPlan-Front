import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useRouteStore } from '../../store/routeStore'
import { distanciaAPuntoRuta } from '../../utils/geo'
import { OSRM_CONFIG } from '../../constants/route'

const PASO = 0.0002 // ~22 metros por tecla

export default function SimuladorGPS() {
  const {
    seguimientoActivo, posicionActual,
    setPosicionActual, segmentosVisuales, recalcularDesde,
  } = useRouteStore()

  const ultimoRecalculo = useRef<number>(0)
  const map = useMap()

  useEffect(() => {
    if (!seguimientoActivo) return

    function onKey(e: KeyboardEvent) {
      const pos = posicionActual ?? { lat: 21.8818, lng: -102.2916 }
      let { lat, lng } = pos

      if      (e.key === 'ArrowUp')    lat += PASO
      else if (e.key === 'ArrowDown')  lat -= PASO
      else if (e.key === 'ArrowLeft')  lng -= PASO
      else if (e.key === 'ArrowRight') lng += PASO
      else return

      e.preventDefault()
      setPosicionActual({ lat, lng })
      map.panTo([lat, lng])

      const minDist = segmentosVisuales.length > 0
        ? Math.min(...segmentosVisuales.map(seg => distanciaAPuntoRuta(lat, lng, seg.geometria)))
        : Infinity

      const ahora = Date.now()
      const desvio    = minDist > OSRM_CONFIG.UMBRAL_DESVIACION_METROS
      const cooldownOk = ahora - ultimoRecalculo.current > 10_000

      if (desvio && cooldownOk) {
        ultimoRecalculo.current = ahora
        recalcularDesde(lat, lng)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seguimientoActivo, posicionActual, segmentosVisuales])

  return null
}