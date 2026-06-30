import { useEffect, useState, useCallback } from 'react'
import { Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { getAlertasActivas, crearAlerta, resolverAlerta, type Alert } from '../services/api'
import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/UiStore'
import {
  WarningOutlined, CarOutlined, ToolOutlined,
  StopOutlined, CloseOutlined, CheckOutlined,
  AlertOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons'

const TIPOS_ALERTA = [
  { key: 'ACCIDENTE',  label: 'Accidente',        color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fecaca' },
  { key: 'TRAFICO',    label: 'Tráfico intenso',   color: '#f97316', bgColor: '#fff7ed', borderColor: '#fed7aa' },
  { key: 'OBRAS',      label: 'Obras',             color: '#eab308', bgColor: '#fefce8', borderColor: '#fde047' },
  { key: 'CIERRE',     label: 'Cierre de calle',   color: '#8b5cf6', bgColor: '#f5f3ff', borderColor: '#ddd6fe' },
  { key: 'INUNDACION', label: 'Inundación',        color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#bfdbfe' },
  { key: 'OTRO',       label: 'Otro',              color: '#6b7280', bgColor: '#f9fafb', borderColor: '#e5e7eb' },
]

const ICONOS_TIPO: Record<string, React.ReactNode> = {
  ACCIDENTE:  <AlertOutlined />,
  TRAFICO:    <CarOutlined />,
  OBRAS:      <ToolOutlined />,
  CIERRE:     <StopOutlined />,
  INUNDACION: <ExclamationCircleOutlined />,
  OTRO:       <WarningOutlined />,
}

function colorParaTipo(tipo: string) {
  return TIPOS_ALERTA.find(t => t.key === tipo)?.color ?? '#6b7280'
}

function iconParaTipo(tipo: string) {
  const color = colorParaTipo(tipo)
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid #fff;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        font-size: 14px; color: #fff; font-weight: 800;
      ">!</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16],
  })
}

function MapClickReporter({ modoClick, onReport, modalAbierto }: {
  modoClick: boolean
  onReport: (lat: number, lng: number) => void
  modalAbierto: boolean
}) {
  useMapEvents({
    click(e) {
      if (modalAbierto) return
      if (modoClick) {
        e.originalEvent.stopPropagation();
        (window as any).__clickBloqueado = true
        setTimeout(() => { (window as any).__clickBloqueado = false }, 300)
        onReport(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export default function AlertasPanel() {
  const [alertas, setAlertas] = useState<Alert[]>([])
  const [modal, setModal] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    (window as any).__modalAbierto = !!modal
  }, [modal])

  const [tipo, setTipo] = useState('ACCIDENTE')
  const [descripcion, setDescripcion] = useState('')
  const { modoAlerta, setModoAlerta } = useUIStore()
  const [loading, setLoading] = useState(false)
  const setAlertasActivas = useRouteStore(s => s.setAlertasActivas)

  const cargarAlertas = useCallback(async () => {
    try {
      const data = await getAlertasActivas()
      setAlertas(data)
      setAlertasActivas(data.map(a => ({ latitud: a.latitud, longitud: a.longitud, tipo: a.tipo })))
    } catch { /* silencioso */ }
  }, [setAlertasActivas])

  useEffect(() => {
    cargarAlertas()
    const interval = setInterval(cargarAlertas, 300_000)
    return () => clearInterval(interval)
  }, [])

  async function handleCrear() {
    if (!modal) return
    setLoading(true)
    try {
      await crearAlerta({ tipo, descripcion, latitud: modal.lat, longitud: modal.lng })
      await cargarAlertas()
      setModal(null)
      setDescripcion('')
      setTipo('ACCIDENTE')
    } catch { /* silencioso */ }
    setLoading(false)
  }

  async function handleResolver(id: string) {
    try { await resolverAlerta(id); await cargarAlertas() } catch { /* silencioso */ }
  }

  return (
    <>
      <MapClickReporter
        modoClick={modoAlerta}
        modalAbierto={!!modal}
        onReport={(lat, lng) => {
          setModal({ lat, lng })
          setModoAlerta(false)
        }}
      />

      {/* Marcadores de alertas en el mapa */}
      {alertas.map(alerta => (
        <Marker key={alerta.id} position={[alerta.latitud, alerta.longitud]} icon={iconParaTipo(alerta.tipo)}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ color: colorParaTipo(alerta.tipo), fontSize: 14 }}>
                  {ICONOS_TIPO[alerta.tipo]}
                </span>
                <span style={{ fontWeight: 800, fontSize: 13, color: colorParaTipo(alerta.tipo) }}>
                  {TIPOS_ALERTA.find(t => t.key === alerta.tipo)?.label}
                </span>
              </div>
              {alerta.descripcion && (
                <div style={{ fontSize: 11, color: '#374151', marginBottom: 4 }}>{alerta.descripcion}</div>
              )}
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>
                Reportado {alerta.vecesReportada}x · expira {new Date(alerta.expiraEn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button onClick={() => handleResolver(alerta.id)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 8,
                background: '#f0fdf4', border: '1px solid #86efac',
                cursor: 'pointer', color: '#16a34a', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <CheckOutlined /> Ya se resolvió
              </button>
            </div>
          </Popup>
          <Circle
            center={[alerta.latitud, alerta.longitud]}
            radius={150}
            pathOptions={{
              color: colorParaTipo(alerta.tipo),
              fillColor: colorParaTipo(alerta.tipo),
              fillOpacity: 0.1,
              weight: 1.5,
            }}
          />
        </Marker>
      ))}

      {/* Modal crear alerta */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 24, width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#003F7F', display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: '#f97316' }} /> Reportar incidente
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>
                <CloseOutlined />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {TIPOS_ALERTA.map(t => (
                <button key={t.key} onClick={() => setTipo(t.key)}
                  style={{
                    padding: '8px 6px', borderRadius: 10,
                    border: `2px solid ${tipo === t.key ? t.color : t.borderColor}`,
                    background: tipo === t.key ? t.bgColor : '#fff',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    color: tipo === t.key ? t.color : '#374151',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ color: t.color, fontSize: 13 }}>{ICONOS_TIPO[t.key]}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Descripción opcional..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              style={{
                width: '100%', borderRadius: 10, border: '1px solid #e2e8f0',
                padding: '8px 10px', fontSize: 12, resize: 'none', height: 60,
                boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setModal(null)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleCrear} disabled={loading}
                style={{ flex: 2, padding: '10px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: '#003F7F', color: '#fff', fontWeight: 800, fontSize: 12, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Enviando...' : 'Reportar aquí'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}