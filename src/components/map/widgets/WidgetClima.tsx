import { CloudOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons'
import { useRouteStore } from '../../../store/routeStore'

export default function WidgetClima() {
  const { clima } = useRouteStore()
  if (!clima) return null

  const esTormenta = clima.factor >= 1.3
  const esLluvia   = clima.factor >= 1.1

  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 16,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', backdropFilter: 'blur(16px)',
      background: esTormenta ? 'rgba(239,68,68,0.92)' : esLluvia ? 'rgba(245,158,11,0.92)' : 'rgba(255,255,255,0.92)',
      color: esLluvia ? '#fff' : '#1a1a1a',
      border: '1px solid rgba(255,255,255,0.35)',
    }}>
      {esTormenta
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
            <span style={{ fontWeight: 800 }}>
              {' '}· +{Math.round((clima.factor - 1) * 100)}% tiempo
            </span>
          )}
        </div>
      </div>
      {esTormenta && <WarningOutlined style={{ fontSize: 13, color: '#fde047' }} />}
    </div>
  )
}