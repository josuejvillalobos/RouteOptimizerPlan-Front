import { useEffect, useRef, useState } from 'react'
import { useRouteStore } from '../../store/routeStore'
import { distanciaAPuntoRuta } from '../../utils/geo'
import { OSRM_CONFIG } from '../../constants/route'

export default function SeguimientoGPS() {
  const {
    resultado, segmentosVisuales, seguimientoActivo,
    setPosicionActual, recalcularDesde,
  } = useRouteStore()

  const [recalculando, setRecalculando] = useState(false)
  const watchIdRef       = useRef<number | null>(null)
  const ultimoRecalculo  = useRef<number>(0)

  useEffect(() => {
    if (!seguimientoActivo) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setPosicionActual(null)
      return
    }

    if (!resultado) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setPosicionActual({ lat, lng })

        const minDist = Math.min(
          ...segmentosVisuales.map(seg => distanciaAPuntoRuta(lat, lng, seg.geometria))
        )

        const ahora = Date.now()
        const desvio = minDist > OSRM_CONFIG.UMBRAL_DESVIACION_METROS
        const cooldownOk = ahora - ultimoRecalculo.current > OSRM_CONFIG.COOLDOWN_RECALCULO_MS

        if (desvio && cooldownOk) {
          ultimoRecalculo.current = ahora
          setRecalculando(true)
          recalcularDesde(lat, lng).finally(() => setRecalculando(false))
        }
      },
      (err) => console.warn('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [seguimientoActivo, resultado])

  if (!recalculando) return null

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2000, background: 'rgba(0,63,127,0.92)',
      backdropFilter: 'blur(8px)', color: '#fff',
      fontSize: 13, fontWeight: 700, padding: '12px 24px',
      borderRadius: 99, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>
      Recalculando ruta...
    </div>
  )
}