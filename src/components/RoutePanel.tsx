import {
  DeleteOutlined, CarOutlined, UserOutlined, ThunderboltOutlined,
  LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
  NodeIndexOutlined, ClockCircleOutlined, DashboardOutlined,
  ApartmentOutlined, CloudOutlined, EnvironmentOutlined,
  InfoCircleOutlined, DownOutlined, UpOutlined, CloseOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { useRouteStore, colorParaIndice } from '../store/routeStore'
import { useUIStore } from '../store/UiStore'
import type { TipoTransporte } from '../types/routeTypes'
import SearchBox from './SearchBox'

export default function RoutePanel() {
  const {
    puntoInicio, paradas, transporte, resultado,
    loading, error, backendOk, clima,
    addParada, removeParada, setTransporte,
    optimizar, limpiarResultado, setPuntoInicio, reset,
  } = useRouteStore()

  const { panelOpen, setPanelOpen } = useUIStore()
  const [showStops, setShowStops] = useState(true)
  const [showResult, setShowResult] = useState(true)

  return (
    <div
      id="route-panel-scroll"
      style={{
        position: 'absolute', top: 16, left: 16, zIndex: 1000,
        width: 340,
        maxHeight: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflowY: 'auto',
        paddingBottom: 8,
        scrollbarWidth: 'thin',
        transform: panelOpen ? 'translateX(0)' : 'translateX(-120%)',
        opacity: panelOpen ? 1 : 0,
        transition: 'transform 0.28s ease, opacity 0.2s ease',
        pointerEvents: panelOpen ? 'auto' : 'none',
      }}>

      {/* Header */}
      <div style={{
        background: '#003F7F',
        borderRadius: 18,
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,63,127,0.35)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: -0.3 }}>
            MIAA — Rutas
          </div>
          <div style={{ color: '#90b8db', fontSize: 11, marginTop: 2 }}>
            Aguascalientes, Mexico
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => { if (confirm('¿Reiniciar la ruta? Se perderán las paradas y el resultado actual.')) reset() }}
            style={{
              width: 28, height: 28, borderRadius: 9,
              background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12,
            }}
            aria-label="Reiniciar ruta"
            title="Reiniciar ruta"
          >
            <ReloadOutlined />
          </button>
          <button
            onClick={() => setPanelOpen(false)}
            style={{
              width: 28, height: 28, borderRadius: 9,
              background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12,
            }}
            aria-label="Cerrar panel"
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* Card reutilizable */}
      {[
        // --- Origen ---
        {
          key: 'origen',
          header: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Origen</span>
            </div>
          ),
          collapsible: false,
          show: true,
          body: (
            <>
              <SearchBox placeholder="Buscar punto de origen..." onSelect={(s) => { setPuntoInicio(s); limpiarResultado() }} />
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f0fdf4', borderRadius: 12 }}>
                <EnvironmentOutlined style={{ color: '#16a34a', fontSize: 12 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#14532d', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {puntoInicio.etiqueta}
                </span>
              </div>
            </>
          ),
        },
        // --- Paradas ---
        {
          key: 'paradas',
          header: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A7FC1', display: 'inline-block' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Paradas</span>
              {paradas.length > 0 && (
                <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 99, background: '#1A7FC1', color: '#fff' }}>
                  {paradas.length}
                </span>
              )}
            </div>
          ),
          collapsible: true,
          show: showStops,
          onToggle: () => setShowStops(!showStops),
          body: (
            <>
              <SearchBox placeholder="Buscar negocio, calle, colonia..." onSelect={(s) => { addParada(s); limpiarResultado() }} />
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9ca3af', paddingLeft: 2 }}>
                <InfoCircleOutlined />
                <span>O haz clic directamente en el mapa</span>
              </div>
              {paradas.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                    {paradas.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#f8fafc', borderRadius: 12, padding: '7px 10px',
                      border: `1px solid ${colorParaIndice(i)}30`,
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', background: colorParaIndice(i),
                        color: '#fff', fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.etiqueta}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.calle.split(',').slice(0, 2).join(',')}</div>
                      </div>
                      <button onClick={() => removeParada(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#d1d5db' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}>
                        <DeleteOutlined style={{ fontSize: 10 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {paradas.length === 0 && (
                <div style={{ marginTop: 8, padding: '16px 12px', textAlign: 'center', fontSize: 11, color: '#9ca3af', border: '1.5px dashed #e5e7eb', borderRadius: 12 }}>
                  Sin paradas agregadas
                </div>
              )}
            </>
          ),
        },
      ].map(card => (
        <div key={card.key} style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div
            onClick={card.collapsible ? card.onToggle : undefined}
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center',
              cursor: card.collapsible ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            {card.header}
            {card.collapsible && (
              card.show
                ? <UpOutlined style={{ fontSize: 10, color: '#d1d5db' }} />
                : <DownOutlined style={{ fontSize: 10, color: '#d1d5db' }} />
            )}
          </div>
          {card.show && <div style={{ padding: 12 }}>{card.body}</div>}
        </div>
      ))}

      {/* Transporte + Boton */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: 12,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['AUTO', 'A_PIE'] as TipoTransporte[]).map(t => (
            <button key={t} onClick={() => setTransporte(t)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 0', borderRadius: 12, border: '1.5px solid',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                background: transporte === t ? '#1A7FC1' : '#fff',
                borderColor: transporte === t ? '#1A7FC1' : '#e2e8f0',
                color: transporte === t ? '#fff' : '#6b7280',
              }}>
              {t === 'AUTO' ? <CarOutlined /> : <UserOutlined />}
              {t === 'AUTO' ? 'Vehiculo' : 'A pie'}
            </button>
          ))}
        </div>

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

        <button onClick={optimizar} disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 0', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: '#1A7FC1', color: '#fff', fontSize: 13, fontWeight: 800,
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 4px 16px rgba(26,127,193,0.35)',
            transition: 'all 0.15s',
          }}>
          {loading ? <LoadingOutlined spin /> : <ThunderboltOutlined />}
          {loading ? 'Calculando ruta...' : 'Calcular Ruta Optima'}
        </button>
      </div>

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

      {/* Resultado */}
      {resultado && (
        <div style={{
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
          borderRadius: 18, border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <button onClick={() => setShowResult(!showResult)}
            style={{
              width: '100%', background: '#1A7FC1', border: 'none', cursor: 'pointer',
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, flex: 1, textAlign: 'left' }}>Ruta calculada</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginRight: 6 }}>
              {resultado.algoritmoUsado?.replace(/_/g, ' ')}
            </span>
            {showResult
              ? <UpOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
              : <DownOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
            }
          </button>

          {showResult && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #f1f5f9' }}>
                {[
                  { icon: <DashboardOutlined />, val: resultado.distanciaTotalKm.toFixed(1), label: 'km' },
                  { icon: <ClockCircleOutlined />, val: resultado.tiempoEstimadoMin, label: 'min' },
                  { icon: <ApartmentOutlined />, val: resultado.segmentos.length, label: 'paradas' },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '10px 0', gap: 2,
                    borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <span style={{ color: '#1A7FC1', fontSize: 12 }}>{s.icon}</span>
                    <span style={{ color: '#003F7F', fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{s.val}</span>
                    <span style={{ color: '#9ca3af', fontSize: 10 }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {resultado.condicionClimatica && (
                <div style={{ padding: '6px 14px', fontSize: 10, color: '#6b7280', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CloudOutlined style={{ color: '#4AABDB' }} />
                  {resultado.condicionClimatica} · factor {resultado.factorClimatico?.toFixed(2)}
                </div>
              )}

              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {resultado.segmentos.map((seg, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, padding: '9px 14px',
                    borderBottom: i < resultado.segmentos.length - 1 ? '1px solid #f8fafc' : 'none',
                    borderLeft: `3px solid ${colorParaIndice(i)}`,
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%', background: colorParaIndice(i),
                      color: '#fff', fontSize: 9, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    }}>{seg.orden}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{seg.origen.etiqueta}</span>
                        <NodeIndexOutlined style={{ color: '#d1d5db', fontSize: 9, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{seg.destino.etiqueta}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                        {seg.distanciaKm.toFixed(2)} km · {seg.tiempoEstimadoMin} min
                        {seg.horaLlegadaEstimada && ` · ${seg.horaLlegadaEstimada}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}