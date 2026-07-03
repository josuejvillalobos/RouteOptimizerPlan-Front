import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useRouteStore } from '../../store/routeStore'
import { useUIStore } from '../../store/UiStore'
import { geocodificarInverso } from '../../services/api'

const iconInicio = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

export default function MarkerInicio() {
  const { puntoInicio, setPuntoInicio } = useRouteStore()
  const { setOrigenPendiente, setOrigenAnterior } = useUIStore()

  const handlers = {
    dragstart() {
      setOrigenAnterior({ lat: puntoInicio.latitud, lng: puntoInicio.longitud })
    },
    async dragend(e: any) {
      const { lat, lng } = e.target.getLatLng()
      const etiqueta = await geocodificarInverso(lat, lng)
      setPuntoInicio({ etiqueta, calle: etiqueta, latitud: lat, longitud: lng })
      setOrigenPendiente({ lat, lng })
    },
  }

  return (
    <Marker
      position={[puntoInicio.latitud, puntoInicio.longitud]}
      icon={iconInicio}
      draggable={true}
      eventHandlers={handlers}
    >
      <Popup>
        <b style={{ color: '#003F7F' }}>Inicio — arrastra para mover</b>
        <br />
        <span style={{ fontSize: 12 }}>{puntoInicio.etiqueta}</span>
      </Popup>
    </Marker>
  )
}   