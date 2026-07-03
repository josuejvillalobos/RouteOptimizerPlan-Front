import { useState } from 'react'
import { ReloadOutlined, CloseOutlined, UpOutlined, DownOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useUIStore } from '../../store/UiStore'
import { useRouteStore } from '../../store/routeStore'

import OrigenCard     from './OrigenCard'
import ParadasCard    from './ParadasCard'
import TransporteCard from './TransporteCard'
import ResultadoCard  from './ResultadoCard'

// ─── Card reutilizable ────────────────────────────────────────────────────────

interface CardProps {
  header:      React.ReactNode
  children:    React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

function Card({ header, children, collapsible = false, defaultOpen = true }: CardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
      borderRadius: 18, border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <div
        onClick={collapsible ? () => setOpen(!open) : undefined}
        style={{
          padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center',
          cursor: collapsible ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {header}
        {collapsible && (
          open
            ? <UpOutlined   style={{ fontSize: 10, color: '#d1d5db' }} />
            : <DownOutlined style={{ fontSize: 10, color: '#d1d5db' }} />
        )}
      </div>
      {open && <div style={{ padding: 12 }}>{children}</div>}
    </div>
  )
}

// ─── Header del panel ─────────────────────────────────────────────────────────

function PanelHeader() {
  const { setPanelOpen }  = useUIStore()
  const { reset }         = useRouteStore()

  return (
    <div style={{
      background: '#003F7F', borderRadius: 18, padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,63,127,0.35)',
      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: -0.3 }}>MIAA — Rutas</div>
        <div style={{ color: '#90b8db', fontSize: 11, marginTop: 2 }}>Aguascalientes, Mexico</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => { if (confirm('¿Reiniciar la ruta? Se perderán las paradas y el resultado actual.')) reset() }}
          style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}
          title="Reiniciar ruta"
        >
          <ReloadOutlined />
        </button>
        <button
          onClick={() => setPanelOpen(false)}
          style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}
        >
          <CloseOutlined />
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RoutePanel() {
  const { panelOpen }               = useUIStore()
  const { error, paradas, origenPendiente } = {
    ...useRouteStore(),
    origenPendiente: useUIStore().origenPendiente,
  }

  return (
    <div
      id="route-panel-scroll"
      style={{
        position: 'absolute', top: 16, left: 16, zIndex: 1000,
        width: 340, maxHeight: 'calc(100vh - 32px)',
        display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto', paddingBottom: 8, scrollbarWidth: 'thin',
        transform:     panelOpen ? 'translateX(0)' : 'translateX(-120%)',
        opacity:       panelOpen ? 1 : 0,
        transition:    'transform 0.28s ease, opacity 0.2s ease',
        pointerEvents: panelOpen ? 'auto' : 'none',
      }}
    >
      <PanelHeader />

      {/* Origen */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: origenPendiente ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
              {origenPendiente ? 'Confirmar origen' : 'Origen'}
            </span>
          </div>
        }
      >
        <OrigenCard />
      </Card>

      {/* Paradas */}
      <Card
        collapsible
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A7FC1', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Paradas</span>
            {paradas.length > 0 && (
              <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 99, background: '#1A7FC1', color: '#fff' }}>
                {paradas.length}
              </span>
            )}
          </div>
        }
      >
        <ParadasCard />
      </Card>

      <TransporteCard />

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(254,242,242,0.95)', backdropFilter: 'blur(16px)',
          border: '1px solid #fecaca', borderRadius: 14,
          padding: '10px 14px', fontSize: 12, color: '#dc2626',
          display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0,
        }}>
          <CloseCircleOutlined style={{ marginTop: 1 }} />
          {error}
        </div>
      )}

      <ResultadoCard />
    </div>
  )
}