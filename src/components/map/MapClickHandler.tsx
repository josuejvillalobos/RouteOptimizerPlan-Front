import { useMapEvents } from 'react-leaflet'
import { useRouteStore } from '../../store/routeStore'
import { geocodificarInverso, registrarDomicilioAprendizaje } from '../../services/api'
import { useUIStore } from '../../store/UiStore'
import type { Stop } from '../../types/routeTypes'

// Flag global para bloquear clicks accidentales
export let clickBloqueado = false
export function bloquearClick(ms = 300) {
  clickBloqueado = true
  setTimeout(() => { clickBloqueado = false }, ms)
}

export default function MapClickHandler() {
  const { addParada, limpiarResultado, resultado } = useRouteStore()
  const { busquedaFallida, setBusquedaFallida } = useUIStore()

  useMapEvents({
    click(e) {
      if (clickBloqueado) return
      if ((window as any).__clickBloqueado) return
      if ((window as any).__modalAbierto) return

      const { lat, lng } = e.latlng

      // Modo captura de domicilio no encontrado
      if (busquedaFallida) {
        geocodificarInverso(lat, lng).then(etiqueta => {
          registrarDomicilioAprendizaje({
            busqueda: busquedaFallida,
            latitud:  lat,
            longitud: lng,
            etiqueta,
            fuente:   'MAPA_CLICK',
          })
          addParada({ etiqueta, calle: etiqueta, latitud: lat, longitud: lng } as Stop)
          setBusquedaFallida(null)
          limpiarResultado()
        })
        return
      }

      if (resultado) return

      geocodificarInverso(lat, lng).then(etiqueta => {
        addParada({ etiqueta, calle: etiqueta, latitud: lat, longitud: lng } as Stop)
        limpiarResultado()
      })
    },
  })

  return null
}