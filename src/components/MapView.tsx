import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useRouteStore, colorParaIndice } from '../store/routeStore'
import { useUIStore } from '../store/UiStore'
import type { Stop } from '../types/routeTypes'
import { CloudOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function makeNumberedIcon(numero: number, bg: string) {
  return L.divIcon({
    className: 'numbered-marker',
    html: `
      <div style="
        width: 30px; height: 30px;
        background: ${bg};
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: #fff; font-weight: 800; font-size: 12px;
          font-family: Arial, sans-serif;
        ">${numero}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })
}

const makeIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const iconInicio = makeIcon('green')

function FlyToController() {
  const { flyTo, clearFlyTo } = useRouteStore()
  const map = useMap()

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lon], flyTo.zoom ?? 17, { duration: 1.2 })
      clearFlyTo()
    }
  }, [flyTo])

  return null
}

function MapClickHandler() {
  const { addParada, paradas, limpiarResultado } = useRouteStore()
  useMapEvents({
    click(e) {
      addParada({
        etiqueta: `Parada ${paradas.length + 1}`,
        calle: `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`,
        latitud: e.latlng.lat,
        longitud: e.latlng.lng,
      } as Stop)
      limpiarResultado()
    },
  })
  return null
}

function PanelAutoClose() {
  const { setPanelOpen } = useUIStore()
  useMapEvents({
    dragstart() {
      if (window.innerWidth < 768) setPanelOpen(false)
    },
  })
  return null
}

export default function MapView() {
  const { puntoInicio, paradas, resultado, segmentosVisuales, clima, loadClima, backendOk } = useRouteStore()
  const { panelOpen, togglePanel } = useUIStore()

  useEffect(() => { loadClima() }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <MapContainer
        center={[21.8818, -102.2916]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        <FlyToController />
        <MapClickHandler />
        <PanelAutoClose />

        <Marker position={[puntoInicio.latitud, puntoInicio.longitud]} icon={iconInicio}>
          <Popup>
            <b style={{ color: '#003F7F' }}>Inicio</b><br />
            <span style={{ fontSize: 12 }}>{puntoInicio.etiqueta}</span>
          </Popup>
        </Marker>

        {!resultado && paradas.map((p, i) => (
          <Marker key={i} position={[p.latitud, p.longitud]} icon={makeNumberedIcon(i + 1, colorParaIndice(i))}>
            <Popup>
              <b style={{ color: colorParaIndice(i) }}>Parada {i + 1}</b><br />
              <span style={{ fontSize: 12 }}>{p.etiqueta}</span>
            </Popup>
          </Marker>
        ))}

        {resultado && (
          <>
            {segmentosVisuales.length > 0 ? (
              segmentosVisuales.map((seg, i) => (
                <Polyline
                  key={i}
                  positions={seg.geometria}
                  pathOptions={{ color: seg.color, weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                />
              ))
            ) : (
              resultado.segmentos.map((s, i) => (
                <Polyline
                  key={i}
                  positions={[
                    [s.origen.latitud, s.origen.longitud],
                    [s.destino.latitud, s.destino.longitud],
                  ]}
                  pathOptions={{ color: colorParaIndice(i), weight: 5, opacity: 0.7, dashArray: '8 6' }}
                />
              ))
            )}
            <Marker position={[puntoInicio.latitud, puntoInicio.longitud]} icon={iconInicio}>
              <Popup><b style={{ color: '#003F7F' }}>Inicio</b><br />{puntoInicio.etiqueta}</Popup>
            </Marker>
            {resultado.segmentos.map((seg, i) => {
              const color = colorParaIndice(i)
              return (
                <Marker key={i} position={[seg.destino.latitud, seg.destino.longitud]} icon={makeNumberedIcon(i + 1, color)}>
                  <Popup>
                    <b style={{ color }}>#{i + 1} {seg.destino.etiqueta}</b><br />
                    <span style={{ fontSize: 12 }}>
                      {seg.distanciaKm.toFixed(2)} km — {seg.tiempoEstimadoMin} min
                      {seg.horaLlegadaEstimada && <><br />Llegada: {seg.horaLlegadaEstimada}</>}
                    </span>
                  </Popup>
                </Marker>
              )
            })}
          </>
        )}
      </MapContainer>

      {clima && (
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(16px)',
          background: clima.factor >= 1.3
            ? 'rgba(239,68,68,0.92)'
            : clima.factor >= 1.1
            ? 'rgba(245,158,11,0.92)'
            : 'rgba(255,255,255,0.92)',
          color: clima.factor >= 1.1 ? '#fff' : '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.35)',
        }}>
          {clima.factor >= 1.3
            ? <ThunderboltOutlined style={{ fontSize: 16 }} />
            : <CloudOutlined style={{ fontSize: 16 }} />
          }
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {clima.temperatura}°C — {clima.descripcion}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              Viento {clima.viento} km/h
              {clima.factor > 1.0 && (
                <span style={{ fontWeight: 800 }}> · +{Math.round((clima.factor - 1) * 100)}% tiempo</span>
              )}
            </div>
          </div>
          {clima.factor >= 1.3 && <WarningOutlined style={{ fontSize: 13, color: '#fde047' }} />}
        </div>
      )}

      <div style={{
        position: 'absolute', top: clima ? 80 : 16, right: 16, zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 99,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        fontSize: 10, fontWeight: 600,
        color: backendOk ? '#16a34a' : '#dc2626',
        transition: 'top 0.2s ease',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: backendOk ? '#22c55e' : '#ef4444',
          boxShadow: backendOk ? '0 0 0 3px rgba(34,197,94,0.2)' : '0 0 0 3px rgba(239,68,68,0.2)',
        }} />
        {backendOk ? 'Conectado' : 'Sin conexion'}
      </div>

      {paradas.length === 0 && !resultado && (
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, pointerEvents: 'none',
          background: 'rgba(0,63,127,0.88)', backdropFilter: 'blur(8px)',
          color: '#fff', fontSize: 12, fontWeight: 600,
          padding: '8px 20px', borderRadius: 99,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>
          Haz clic en el mapa para agregar paradas
        </div>
      )}

      {!panelOpen && (
        <button
          onClick={togglePanel}
          style={{
            position: 'absolute', top: 16, left: 16, zIndex: 1000,
            width: 48, height: 48, borderRadius: 14,
            background: '#003F7F', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,63,127,0.4)',
            color: '#fff', fontSize: 18,
          }}
          aria-label="Abrir panel"
        >
          ☰
        </button>
      )}
    </div>
  )
}