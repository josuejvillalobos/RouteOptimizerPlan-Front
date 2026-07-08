import { useRouteStore } from '../../../store/routeStore'

export default function HintAgregarParadas() {
  const { paradas, resultado } = useRouteStore()
  if (paradas.length > 0 || resultado) return null

  return (
    <div style={{
      position: 'absolute', bottom: 32, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000, pointerEvents: 'none',
      background: 'rgba(0,63,127,0.88)', backdropFilter: 'blur(8px)',
      color: '#fff', fontSize: 12, fontWeight: 600,
      padding: '8px 20px', borderRadius: 99,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
    }}>
      Haz clic en el mapa para agregar paradas
    </div>
  )
}