import { CarOutlined, UserOutlined, ThunderboltOutlined, LoadingOutlined, EnvironmentOutlined, CloudOutlined } from '@ant-design/icons'
import { useRouteStore } from '../../store/routeStore'
import type { TipoTransporte } from '../../types/routeTypes'

export default function TransporteCard() {
  const {
    transporte, setTransporte,
    retornarAlInicio, setRetornarAlInicio,
    clima, loading, resultado,
    modoOrden, optimizar, optimizarManual, limpiarResultado,
    seguimientoActivo, setSeguimientoActivo,
  } = useRouteStore()

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
      borderRadius: 18, border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: 12, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>

      {/* Selector vehículo / a pie */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['AUTO', 'A_PIE'] as TipoTransporte[]).map(t => (
          <button
            key={t}
            onClick={() => setTransporte(t)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 12, border: '1.5px solid',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              background:  transporte === t ? '#1A7FC1' : '#fff',
              borderColor: transporte === t ? '#1A7FC1' : '#e2e8f0',
              color:       transporte === t ? '#fff' : '#6b7280',
            }}
          >
            {t === 'AUTO' ? <CarOutlined /> : <UserOutlined />}
            {t === 'AUTO' ? 'Vehiculo' : 'A pie'}
          </button>
        ))}
      </div>

      {/* Toggle retornar al almacén */}
      <div
        onClick={() => { setRetornarAlInicio(!retornarAlInicio); limpiarResultado() }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 12, cursor: 'pointer',
          background: retornarAlInicio ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${retornarAlInicio ? '#86efac' : '#e2e8f0'}`,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: retornarAlInicio ? '#16a34a' : '#374151' }}>
            Retornar al almacen
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
            Agregar segmento de regreso al inicio
          </div>
        </div>
        <div style={{
          width: 36, height: 20, borderRadius: 99,
          background: retornarAlInicio ? '#16a34a' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2,
            left: retornarAlInicio ? 18 : 2,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>

      {/* Aviso clima */}
      {clima && clima.factor > 1.0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 12,
          background: clima.factor >= 1.3 ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${clima.factor >= 1.3 ? '#fecaca' : '#fde68a'}`,
          fontSize: 11, fontWeight: 600,
          color: clima.factor >= 1.3 ? '#dc2626' : '#b45309',
        }}>
          <CloudOutlined />
          <span>{clima.descripcion} — tiempo estimado +{Math.round((clima.factor - 1) * 100)}%</span>
        </div>
      )}

      {/* Botón calcular */}
      <button
        onClick={modoOrden === 'manual' ? optimizarManual : optimizar}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 0', borderRadius: 14, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: '#1A7FC1', color: '#fff', fontSize: 13, fontWeight: 800,
          opacity: loading ? 0.6 : 1,
          boxShadow: '0 4px 16px rgba(26,127,193,0.35)', transition: 'all 0.15s',
        }}
      >
        {loading ? <LoadingOutlined spin /> : <ThunderboltOutlined />}
        {loading ? 'Calculando ruta...' : 'Calcular Ruta Optima'}
      </button>

      {/* Botón seguimiento GPS */}
      {resultado && (
        <button
          onClick={() => setSeguimientoActivo(!seguimientoActivo)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 0', borderRadius: 14, border: '1.5px solid',
            cursor: 'pointer', fontSize: 12, fontWeight: 700,
            background:  seguimientoActivo ? '#16a34a' : '#f0fdf4',
            color:       seguimientoActivo ? '#fff' : '#16a34a',
            borderColor: seguimientoActivo ? '#16a34a' : '#86efac',
            transition: 'all 0.2s',
          }}
        >
          <EnvironmentOutlined />
          {seguimientoActivo ? 'Seguimiento activo — detener' : 'Iniciar seguimiento GPS'}
        </button>
      )}
    </div>
  )
}