import { WarningOutlined, CloseOutlined } from '@ant-design/icons'
import { useUIStore } from '../../../store/UiStore'

export default function BotonAlerta() {
  const { modoAlerta, setModoAlerta } = useUIStore()

  return (
    <div style={{
      position: 'absolute', bottom: 32, right: 16, zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
    }}>
      {modoAlerta && (
        <div style={{
          background: 'rgba(239,68,68,0.92)', color: '#fff',
          fontSize: 11, fontWeight: 700, padding: '6px 12px',
          borderRadius: 99, backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
        }}>
          Toca el punto del incidente
        </div>
      )}
      <button
        onClick={() => setModoAlerta(!modoAlerta)}
        style={{
          width: 48, height: 48, borderRadius: 14,
          background: modoAlerta ? '#ef4444' : '#003F7F',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          color: '#fff', fontSize: 18, transition: 'background 0.2s',
        }}
      >
        {modoAlerta ? <CloseOutlined /> : <WarningOutlined />}
      </button>
    </div>
  )
}