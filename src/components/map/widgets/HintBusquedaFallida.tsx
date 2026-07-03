import { useUIStore } from '../../../store/UiStore'

export default function HintBusquedaFallida() {
  const { busquedaFallida, setBusquedaFallida } = useUIStore()
  if (!busquedaFallida) return null

  return (
    <div style={{
      position: 'absolute', bottom: 90, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <div style={{
        background: 'rgba(0,63,127,0.92)', backdropFilter: 'blur(8px)',
        color: '#fff', fontSize: 12, fontWeight: 700,
        padding: '8px 20px', borderRadius: 99,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
      }}>
        Toca el mapa para ubicar "{busquedaFallida}"
      </div>
      <button
        onClick={() => setBusquedaFallida(null)}
        style={{
          background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb',
          borderRadius: 99, cursor: 'pointer', fontSize: 11,
          fontWeight: 600, color: '#374151', padding: '4px 14px',
        }}
      >
        Cancelar
      </button>
    </div>
  )
}