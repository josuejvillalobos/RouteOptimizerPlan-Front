import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useRouteStore, colorParaIndice } from '../../../store/routeStore'

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

export default function ParadasSinOptimizar() {
  const { paradas, resultado, transporte } = useRouteStore()
  if (resultado) return null

  return (
    <>
      {paradas.map((p, i) => (
        <Marker
          key={i}
          position={[p.latitud, p.longitud]}
          icon={makeNumberedIcon(i + 1, colorParaIndice(i + 1), transporte === 'A_PIE')}
        >
          <Popup>
            <b style={{ color: colorParaIndice(i + 1) }}>Parada {i + 1}</b><br />
            <span style={{ fontSize: 12 }}>{p.etiqueta}</span>
          </Popup>
        </Marker>
      ))}
    </>
  )
}