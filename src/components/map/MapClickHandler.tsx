import { useMapEvents } from 'react-leaflet'
import { useRouteStore } from '../../store/routeStore'
import { useUIStore } from '../../store/UiStore'
import { geocodificarInverso } from '../../services/api'
import type { Stop } from '../../types/routeTypes'

// Flag global para bloquear clicks accidentales
export let clickBloqueado = false
export function bloquearClick(ms = 300) {
  clickBloqueado = true
  setTimeout(() => { clickBloqueado = false }, ms)
}

export default function MapClickHandler() {
  const { addParada, limpiarResultado, resultado } = useRouteStore()

  useMapEvents({
    click(e) {
      if (resultado) return
      if (clickBloqueado) return
      if ((window as any).__clickBloqueado) return
      if ((window as any).__modalAbierto) return

      geocodificarInverso(e.latlng.lat, e.latlng.lng).then(etiqueta => {
        addParada({
          etiqueta,
          calle:    etiqueta,
          latitud:  e.latlng.lat,
          longitud: e.latlng.lng,
        } as Stop)
        limpiarResultado()
      })
    },
  })

  return null
}