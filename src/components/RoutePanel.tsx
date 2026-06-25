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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableParada({ parada, index, onRemove }: { parada: any; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: parada.etiqueta + index })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 8,
        background: isDragging ? '#f0f7ff' : '#f8fafc',
        borderRadius: 12, padding: '7px 10px',
        border: `1px solid ${colorParaIndice(index + 1)}30`,
        cursor: 'default',
      }}
    >
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#d1d5db', fontSize: 14, flexShrink: 0, padding: '0 2px' }}>
        ⠿
      </div>
      <span style={{ width: 18, height: 18, borderRadius: '50%', background: colorParaIndice(index + 1), color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{index + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parada.etiqueta}</div>
        <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parada.calle.split(',').slice(0, 2).join(',')}</div>
      </div>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#d1d5db' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}>
        <DeleteOutlined style={{ fontSize: 10 }} />
      </button>
    </div>
  )
} 

export default function RoutePanel() {
  const {
    puntoInicio, paradas, transporte, resultado,
    loading, error, backendOk, clima,
    addParada, removeParada, setTransporte,
    optimizar, optimizarManual, limpiarResultado, setPuntoInicio, reset,
    retornarAlInicio, setRetornarAlInicio,
    modoOrden, setModoOrden, paradasManual, setParadasManual,  } = useRouteStore()

  const { panelOpen, setPanelOpen, origenPendiente, origenAnterior, cancelarOrigen } = useUIStore()
  const [showStops, setShowStops] = useState(true)
  const [showResult, setShowResult] = useState(true)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const listaActual = modoOrden === 'manual' && paradasManual.length > 0 ? paradasManual : paradas
    const oldIndex = listaActual.findIndex((p, i) => p.etiqueta + i === active.id)
    const newIndex = listaActual.findIndex((p, i) => p.etiqueta + i === over.id)
    const nuevaLista = arrayMove(listaActual, oldIndex, newIndex)
    setParadasManual(nuevaLista)
    setModoOrden('manual')
    limpiarResultado()
  }

  return (

    
    <div
      id="route-panel-scroll"
      style={{
        position: 'absolute', top: 16, left: 16, zIndex: 1000,
        width: 340, maxHeight: 'calc(100vh - 32px)',
        display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto', paddingBottom: 8, scrollbarWidth: 'thin',
        transform: panelOpen ? 'translateX(0)' : 'translateX(-120%)',
        opacity: panelOpen ? 1 : 0,
        transition: 'transform 0.28s ease, opacity 0.2s ease',
        pointerEvents: panelOpen ? 'auto' : 'none',
      }}>

      {/* Header */}
      <div style={{ background: '#003F7F', borderRadius: 18, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,63,127,0.35)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: -0.3 }}>MIAA — Rutas</div>
          <div style={{ color: '#90b8db', fontSize: 11, marginTop: 2 }}>Aguascalientes, Mexico</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => { if (confirm('¿Reiniciar la ruta? Se perderán las paradas y el resultado actual.')) reset() }}
            style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}
            aria-label="Reiniciar ruta" title="Reiniciar ruta"
          >
            <ReloadOutlined />
          </button>
          <button
            onClick={() => setPanelOpen(false)}
            style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}
            aria-label="Cerrar panel"
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* Cards */}
      {[
        // --- Origen ---
        {
          key: 'origen',
          header: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: origenPendiente ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
                {origenPendiente ? 'Confirmar origen' : 'Origen'}
              </span>
            </div>
          ),
          collapsible: false,
          show: true,
          body: origenPendiente ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '8px 10px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>Pin movido a nueva posicion</div>
                <div style={{ fontSize: 10, color: '#b45309', marginTop: 2 }}>
                  {puntoInicio.etiqueta}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    setPuntoInicio({
                      etiqueta: puntoInicio.etiqueta,
                      calle: puntoInicio.calle,
                      latitud: origenPendiente.lat,
                      longitud: origenPendiente.lng,
                    })
                    limpiarResultado()
                    cancelarOrigen()
                  }}
                  style={{ flex: 1, background: '#003F7F', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700, padding: '9px 0' }}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    if (origenAnterior) {
                      setPuntoInicio({
                        etiqueta: puntoInicio.etiqueta,
                        calle: puntoInicio.calle,
                        latitud: origenAnterior.lat,
                        longitud: origenAnterior.lng,
                      })
                    }
                    cancelarOrigen()
                  }}
                  style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 600, padding: '9px 0' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
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
                <>
                  {/* Toggle modo orden */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, marginBottom: 4 }}>
                    {(['optimizado', 'manual'] as const).map(modo => (
                      <button key={modo} onClick={() => { setModoOrden(modo); limpiarResultado() }}
                        style={{
                          flex: 1, fontSize: 10, fontWeight: 700, padding: '5px 0',
                          borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                          background: modoOrden === modo ? '#003F7F' : '#fff',
                          borderColor: modoOrden === modo ? '#003F7F' : '#e2e8f0',
                          color: modoOrden === modo ? '#fff' : '#6b7280',
                        }}>
                        {modo === 'optimizado' ? 'Orden sistema' : 'Orden manual'}
                      </button>
                    ))}
                  </div>
                  {modoOrden === 'manual' && (
                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4, paddingLeft: 2 }}>
                      Arrastra ⠿ para reordenar
                    </div>
                  )}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={(modoOrden === 'manual' && paradasManual.length > 0 ? paradasManual : paradas).map((p, i) => p.etiqueta + i)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                        {(modoOrden === 'manual' && paradasManual.length > 0 ? paradasManual : paradas).map((p, i) => (
                          <SortableParada
                            key={p.etiqueta + i}
                            parada={p}
                            index={i}
                            onRemove={() => removeParada(i)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
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
        <div key={card.key} style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', flexShrink: 0 }}>
          <div
            onClick={card.collapsible ? card.onToggle : undefined}
            style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', cursor: card.collapsible ? 'pointer' : 'default', userSelect: 'none' }}
          >
            {card.header}
            {card.collapsible && (card.show ? <UpOutlined style={{ fontSize: 10, color: '#d1d5db' }} /> : <DownOutlined style={{ fontSize: 10, color: '#d1d5db' }} />)}
          </div>
          {card.show && <div style={{ padding: 12 }}>{card.body}</div>}
        </div>
      ))}

      {/* Transporte + Boton */}
      <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 12, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['AUTO', 'A_PIE'] as TipoTransporte[]).map(t => (
            <button key={t} onClick={() => setTransporte(t)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 12, border: '1.5px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: transporte === t ? '#1A7FC1' : '#fff', borderColor: transporte === t ? '#1A7FC1' : '#e2e8f0', color: transporte === t ? '#fff' : '#6b7280' }}>
              {t === 'AUTO' ? <CarOutlined /> : <UserOutlined />}
              {t === 'AUTO' ? 'Vehiculo' : 'A pie'}
            </button>
          ))}
        </div>

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

        {clima && clima.factor > 1.0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12, background: clima.factor >= 1.3 ? '#fef2f2' : '#fffbeb', border: `1px solid ${clima.factor >= 1.3 ? '#fecaca' : '#fde68a'}`, fontSize: 11, fontWeight: 600, color: clima.factor >= 1.3 ? '#dc2626' : '#b45309' }}>
            <CloudOutlined />
            <span>{clima.descripcion} — tiempo estimado +{Math.round((clima.factor - 1) * 100)}%</span>
          </div>
        )}

        <button onClick={modoOrden === 'manual' ? optimizarManual : optimizar} disabled={loading}          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: '#1A7FC1', color: '#fff', fontSize: 13, fontWeight: 800, opacity: loading ? 0.6 : 1, boxShadow: '0 4px 16px rgba(26,127,193,0.35)', transition: 'all 0.15s' }}>
          {loading ? <LoadingOutlined spin /> : <ThunderboltOutlined />}
          {loading ? 'Calculando ruta...' : 'Calcular Ruta Optima'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(254,242,242,0.95)', backdropFilter: 'blur(16px)', border: '1px solid #fecaca', borderRadius: 14, padding: '10px 14px', fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0 }}>
          <CloseCircleOutlined style={{ marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', flexShrink: 0 }}>
          <button onClick={() => setShowResult(!showResult)}
            style={{ width: '100%', background: '#1A7FC1', border: 'none', cursor: 'pointer', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, flex: 1, textAlign: 'left' }}>Ruta calculada</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginRight: 6 }}>{resultado.algoritmoUsado?.replace(/_/g, ' ')}</span>
            {showResult ? <UpOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }} /> : <DownOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }} />}
          </button>

          {showResult && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #f1f5f9' }}>
                {[
                  { icon: <DashboardOutlined />, val: resultado.distanciaTotalKm.toFixed(1), label: 'km' },
                  { icon: <ClockCircleOutlined />, val: resultado.tiempoEstimadoMin, label: 'min' },
                  { icon: <ApartmentOutlined />, val: resultado.segmentos.length, label: 'paradas' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 2, borderRight: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
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
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderBottom: i < resultado.segmentos.length - 1 ? '1px solid #f8fafc' : 'none', borderLeft: `3px solid ${colorParaIndice(i + 1)}` }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: colorParaIndice(i + 1), color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{seg.orden}</span>
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