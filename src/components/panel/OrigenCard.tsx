import { EnvironmentOutlined } from '@ant-design/icons'
import { useRouteStore } from '../../store/routeStore'
import { useUIStore } from '../../store/UiStore'
import SearchBox from '../SearchBox'

export default function OrigenCard() {
  const { puntoInicio, setPuntoInicio, limpiarResultado } = useRouteStore()
  const { origenPendiente, origenAnterior, cancelarOrigen } = useUIStore()

  if (origenPendiente) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ padding: '8px 10px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>Pin movido a nueva posicion</div>
          <div style={{ fontSize: 10, color: '#b45309', marginTop: 2 }}>{puntoInicio.etiqueta}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setPuntoInicio({
                etiqueta: puntoInicio.etiqueta,
                calle:    puntoInicio.calle,
                latitud:  origenPendiente.lat,
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
                  calle:    puntoInicio.calle,
                  latitud:  origenAnterior.lat,
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
    )
  }

  return (
    <>
      <SearchBox
        placeholder="Buscar punto de origen..."
        onSelect={(s) => { setPuntoInicio(s); limpiarResultado() }}
      />
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f0fdf4', borderRadius: 12 }}>
        <EnvironmentOutlined style={{ color: '#16a34a', fontSize: 12 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#14532d', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {puntoInicio.etiqueta}
        </span>
      </div>
    </>
  )
}