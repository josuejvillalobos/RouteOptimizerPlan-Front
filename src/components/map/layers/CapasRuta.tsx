import { Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useRouteStore, colorParaIndice } from '../../../store/routeStore'

// ─── Iconos ───────────────────────────────────────────────────────────────────

function makeNumberedIcon(numero: number, bg: string, aPie = false) {
  return L.divIcon({
    className: 'numbered-marker',
    html: `
      <div style="width:30px;height:30px;background:${bg};border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);color:#fff;font-weight:800;font-size:${aPie ? '14' : '12'}px;font-family:Arial,sans-serif;">
          ${aPie
            ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-1 5h2a2 2 0 0 1 2 2v4h-1v5h-4v-5H9V9a2 2 0 0 1 2-2z"/></svg>`
            : numero
          }
        </span>
      </div>`,
    iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28],
  })
}

const iconPosicion = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#1A7FC1;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(26,127,193,0.3);"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8],
})

// ─── Alternativas ─────────────────────────────────────────────────────────────

function RutasAlternativas() {
  const { alternativas, alternativaActiva, setAlternativaActiva } = useRouteStore()

  return (
    <>
      {alternativas.map((alt, i) => {
        const esActiva = alternativaActiva === i + 1
        return (
          <Polyline
            key={`alt-${i}`}
            positions={alt.geometria}
            pathOptions={{
              color:   esActiva ? '#1A7FC1' : '#94a3b8',
              weight:  esActiva ? 6 : 5,
              opacity: esActiva ? 0.9 : 0.4,
              lineCap: 'round', lineJoin: 'round',
            }}
            eventHandlers={{
              click() {
                ;(window as any).__clickBloqueado = true
                setTimeout(() => { (window as any).__clickBloqueado = false }, 300)
                setAlternativaActiva(i + 1)
              },
              mouseover(e) { if (!esActiva) e.target.setStyle({ opacity: 0.7, weight: 6 }) },
              mouseout(e)  { if (!esActiva) e.target.setStyle({ opacity: 0.4, weight: 5 }) },
            }}
          />
        )
      })}
    </>
  )
}

// ─── Ruta principal ───────────────────────────────────────────────────────────

function RutaPrincipal() {
  const { resultado, segmentosVisuales, alternativaActiva } = useRouteStore()
  if (!resultado) return null

  if (segmentosVisuales.length > 0) {
    return (
      <>
        {segmentosVisuales.map((seg, i) => (
          <Polyline key={i} positions={seg.geometria}
            pathOptions={{
              color:   alternativaActiva === 0 ? seg.color : '#94a3b8',
              weight:  alternativaActiva === 0 ? 6 : 4,
              opacity: alternativaActiva === 0 ? 0.9 : 0.35,
              lineCap: 'round', lineJoin: 'round',
            }} />
        ))}
      </>
    )
  }

  return (
    <>
      {resultado.segmentos.map((s, i) => (
        <Polyline key={i}
          positions={[[s.origen.latitud, s.origen.longitud], [s.destino.latitud, s.destino.longitud]]}
          pathOptions={{ color: i === 0 ? '#22c55e' : colorParaIndice(i), weight: 5, opacity: 0.7, dashArray: '8 6' }} />
      ))}
    </>
  )
}

// ─── Marcadores de paradas optimizadas ───────────────────────────────────────

function MarcadoresParadas() {
  const { resultado, transporte } = useRouteStore()
  if (!resultado) return null

  return (
    <>
      {resultado.segmentos.map((seg, i) => {
        const color = colorParaIndice(i + 1)
        return (
          <Marker key={i}
            position={[seg.destino.latitud, seg.destino.longitud]}
            icon={makeNumberedIcon(i + 1, color, transporte === 'A_PIE')}
          >
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
  )
}

// ─── Punto GPS actual ─────────────────────────────────────────────────────────

function PuntoGPS() {
  const { posicionActual } = useRouteStore()
  if (!posicionActual) return null

  return (
    <Marker position={[posicionActual.lat, posicionActual.lng]} icon={iconPosicion}>
      <Popup><b>Tu posición actual</b></Popup>
    </Marker>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CapasRuta() {
  const { resultado } = useRouteStore()
  if (!resultado) return null

  return (
    <>
      <RutasAlternativas />
      <RutaPrincipal />
      <MarcadoresParadas />
      <PuntoGPS />
    </>
  )
}