import { useEffect } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { useRouteStore } from '../../store/routeStore'
import { MAPA_DEFAULT } from '../../constants/route'
import 'leaflet-polylinedecorator'

// ─── Controladores del mapa ───────────────────────────────────────────────────
import FlyToController  from './FlyToController'
import MapClickHandler  from './MapClickHandler'
import SeguimientoGPS   from './SeguimientoGps'
import SimuladorGPS     from './SimuladorGps'
import MarkerInicio     from './MarkerInicio'
import ArrowDecorator   from './ArrowDecorator'

// ─── Capas de ruta ────────────────────────────────────────────────────────────
import CapasRuta            from './layers/CapasRuta'
import ParadasSinOptimizar  from './layers/ParadasSinOptimizar'

// ─── Widgets fuera del mapa ───────────────────────────────────────────────────
import WidgetClima          from './widgets/WidgetClima'
import BadgeConexion        from './widgets/BadgeConexion'
import HintAgregarParadas   from './widgets/HintAgregarParadas'
import HintBusquedaFallida  from './widgets/HintBusquedaFallida'
import BotonAlerta          from './widgets/BotonAlerta'
import BotonAbrirPanel      from './widgets/BotonAbrirPanel'

// ─── Alertas ──────────────────────────────────────────────────────────────────
import AlertsPanel from '../AlertsPanel'

// ─── Cerrar panel en móvil al mover mapa ─────────────────────────────────────
import { useMapEvents } from 'react-leaflet'
import { useUIStore } from '../../store/UiStore'

function PanelAutoClose() {
  const { setPanelOpen } = useUIStore()
  useMapEvents({ dragstart() { if (window.innerWidth < 768) setPanelOpen(false) } })
  return null
}

// ─── Setup Leaflet ────────────────────────────────────────────────────────────

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MapView() {
  const { loadClima, resultado, segmentosVisuales } = useRouteStore()
  useEffect(() => {
    loadClima()
    const interval = setInterval(loadClima, 600_000) // cada 10 min
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <MapContainer
        center={MAPA_DEFAULT.CENTER}
        zoom={MAPA_DEFAULT.ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.5} minZoom={14} maxZoom={20}
        />

        <FlyToController />
        <MapClickHandler />
        <PanelAutoClose />
        <SeguimientoGPS />
        <SimuladorGPS />

        {resultado && segmentosVisuales.length > 0 && (
          <ArrowDecorator segmentos={segmentosVisuales} />
        )}

        <MarkerInicio />
        <ParadasSinOptimizar />
        <CapasRuta />
        <AlertsPanel />
      </MapContainer>

      <WidgetClima />
      <BadgeConexion />
      <HintAgregarParadas />
      <HintBusquedaFallida/>
      <BotonAlerta />
      <BotonAbrirPanel />
    </div>
  )
}