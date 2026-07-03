import { useRouteStore } from '../../../store/routeStore'

export default function BadgeConexion() {
  const { backendOk, clima } = useRouteStore()

  return (
    <div style={{
      position: 'absolute', top: clima ? 80 : 16, right: 16, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 10px', borderRadius: 99,
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      fontSize: 10, fontWeight: 600,
      color: backendOk ? '#16a34a' : '#dc2626',
      transition: 'top 0.2s ease',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: backendOk ? '#22c55e' : '#ef4444',
        boxShadow: backendOk
          ? '0 0 0 3px rgba(34,197,94,0.2)'
          : '0 0 0 3px rgba(239,68,68,0.2)',
      }} />
      {backendOk ? 'Conectado' : 'Sin conexion'}
    </div>
  )
}