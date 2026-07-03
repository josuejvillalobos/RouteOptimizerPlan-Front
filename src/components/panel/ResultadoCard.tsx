import { useState } from 'react'
import {
  CheckCircleOutlined, DashboardOutlined, ClockCircleOutlined,
  ApartmentOutlined, CloudOutlined, NodeIndexOutlined,
  UpOutlined, DownOutlined,
} from '@ant-design/icons'
import { useRouteStore, colorParaIndice } from '../../store/routeStore'

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsRuta() {
  const { resultado } = useRouteStore()
  if (!resultado) return null

  const stats = [
    { icon: <DashboardOutlined />, val: resultado.distanciaTotalKm.toFixed(1), label: 'km' },
    { icon: <ClockCircleOutlined />, val: resultado.tiempoEstimadoMin,          label: 'min' },
    { icon: <ApartmentOutlined />,  val: resultado.segmentos.length,            label: 'paradas' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #f1f5f9' }}>
      {stats.map((s, i) => (
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
  )
}

// ─── Alternativas ─────────────────────────────────────────────────────────────

function AlternativasRuta() {
  const { resultado, alternativas, alternativaActiva, setAlternativaActiva } = useRouteStore()
  if (!resultado || alternativas.length === 0) return null

  return (
    <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
        Rutas alternativas
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          onClick={() => setAlternativaActiva(0)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 10px', borderRadius: 10, cursor: 'pointer',
            background: alternativaActiva === 0 ? '#EBF5FF' : '#f8fafc',
            border: `1.5px solid ${alternativaActiva === 0 ? '#1A7FC1' : '#e2e8f0'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 4, borderRadius: 2, background: '#1A7FC1' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: alternativaActiva === 0 ? '#1A7FC1' : '#374151' }}>
              Ruta principal
            </span>
          </div>
          <span style={{ fontSize: 10, color: '#6b7280' }}>
            {resultado.distanciaTotalKm.toFixed(1)} km · {resultado.tiempoEstimadoMin} min
          </span>
        </div>

        {alternativas.map((alt, i) => (
          <div
            key={i}
            onClick={() => setAlternativaActiva(i + 1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 10px', borderRadius: 10, cursor: 'pointer',
              background: alternativaActiva === i + 1 ? '#f1f5f9' : '#f8fafc',
              border: `1.5px solid ${alternativaActiva === i + 1 ? '#64748b' : '#e2e8f0'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 4, borderRadius: 2, background: '#94a3b8' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                Alternativa {i + 1}
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#6b7280' }}>
              {alt.distanciaKm.toFixed(1)} km · {alt.tiempoMin} min
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Lista de segmentos ───────────────────────────────────────────────────────

function ListaSegmentos() {
  const { resultado } = useRouteStore()
  if (!resultado) return null

  return (
    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
      {resultado.segmentos.map((seg, i) => (
        <div key={i} style={{
          display: 'flex', gap: 10, padding: '9px 14px',
          borderBottom: i < resultado.segmentos.length - 1 ? '1px solid #f8fafc' : 'none',
          borderLeft: `3px solid ${colorParaIndice(i + 1)}`,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: colorParaIndice(i + 1),
            color: '#fff', fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1,
          }}>
            {seg.orden}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                {seg.origen.etiqueta}
              </span>
              <NodeIndexOutlined style={{ color: '#d1d5db', fontSize: 9, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                {seg.destino.etiqueta}
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
              {seg.distanciaKm.toFixed(2)} km · {seg.tiempoEstimadoMin} min
              {seg.horaLlegadaEstimada && ` · ${seg.horaLlegadaEstimada}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Card principal ───────────────────────────────────────────────────────────

export default function ResultadoCard() {
  const { resultado } = useRouteStore()
  const [expanded, setExpanded] = useState(true)

  if (!resultado) return null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
      borderRadius: 18, border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', background: '#1A7FC1', border: 'none',
          cursor: 'pointer', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, flex: 1, textAlign: 'left' }}>
          Ruta calculada
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginRight: 6 }}>
          {resultado.algoritmoUsado?.replace(/_/g, ' ')}
        </span>
        {expanded
          ? <UpOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
          : <DownOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
        }
      </button>

      {expanded && (
        <>
          <StatsRuta />

          {resultado.condicionClimatica && (
            <div style={{ padding: '6px 14px', fontSize: 10, color: '#6b7280', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CloudOutlined style={{ color: '#4AABDB' }} />
              {resultado.condicionClimatica} · factor {resultado.factorClimatico?.toFixed(2)}
            </div>
          )}

          <AlternativasRuta />
          <ListaSegmentos />
        </>
      )}
    </div>
  )
}