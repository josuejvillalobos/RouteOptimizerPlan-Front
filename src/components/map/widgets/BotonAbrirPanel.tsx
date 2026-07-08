import { useUIStore } from '../../../store/UiStore'

export default function BotonAbrirPanel() {
  const { panelOpen, togglePanel } = useUIStore()
  if (panelOpen) return null

  return (
    <button
      onClick={togglePanel}
      aria-label="Abrir panel"
      style={{
        position: 'absolute', top: 16, left: 16, zIndex: 1000,
        width: 48, height: 48, borderRadius: 14, background: '#003F7F',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,63,127,0.4)', color: '#fff', fontSize: 18,
      }}
    >
      ☰
    </button>
  )
}