import { useState } from 'react'
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouteStore, colorParaIndice } from '../../store/routeStore'
import SearchBox from '../SearchBox'
import type { Stop } from '../../types/routeTypes'

// ─── Parada sortable individual ───────────────────────────────────────────────

interface SortableParadaProps {
  parada: Stop
  index:  number
  onRemove: () => void
}

function SortableParada({ parada, index, onRemove }: SortableParadaProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: parada.etiqueta + index })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition,
        opacity:    isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 8,
        background: isDragging ? '#f0f7ff' : '#f8fafc',
        borderRadius: 12, padding: '7px 10px',
        border: `1px solid ${colorParaIndice(index + 1)}30`,
        cursor: 'default',
      }}
    >
      <div {...attributes} {...listeners}
        style={{ cursor: 'grab', color: '#d1d5db', fontSize: 14, flexShrink: 0, padding: '0 2px' }}>
        ⠿
      </div>
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        background: colorParaIndice(index + 1),
        color: '#fff', fontSize: 9, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {index + 1}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {parada.etiqueta}
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {parada.calle.split(',').slice(0, 2).join(',')}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#d1d5db' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
      >
        <DeleteOutlined style={{ fontSize: 10 }} />
      </button>
    </div>
  )
}

// ─── Card de paradas ──────────────────────────────────────────────────────────

export default function ParadasCard() {
  const {
    paradas, paradasManual, modoOrden,
    addParada, removeParada, limpiarResultado,
    setModoOrden, setParadasManual,
  } = useRouteStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const lista = modoOrden === 'manual' && paradasManual.length > 0 ? paradasManual : paradas
    const oldIndex = lista.findIndex((p, i) => p.etiqueta + i === active.id)
    const newIndex = lista.findIndex((p, i) => p.etiqueta + i === over.id)

    setParadasManual(arrayMove(lista, oldIndex, newIndex))
    setModoOrden('manual')
    limpiarResultado()
  }

  const listaActual = modoOrden === 'manual' && paradasManual.length > 0 ? paradasManual : paradas

  return (
    <>
      <SearchBox
        placeholder="Buscar negocio, calle, colonia..."
        onSelect={(s) => { addParada(s); limpiarResultado() }}
      />

      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9ca3af', paddingLeft: 2 }}>
        <InfoCircleOutlined />
        <span>O haz clic directamente en el mapa</span>
      </div>

      {paradas.length > 0 && (
        <>
          {/* Toggle modo orden */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, marginBottom: 4 }}>
            {(['optimizado', 'manual'] as const).map(modo => (
              <button
                key={modo}
                onClick={() => { setModoOrden(modo); limpiarResultado() }}
                style={{
                  flex: 1, fontSize: 10, fontWeight: 700, padding: '5px 0',
                  borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                  background:   modoOrden === modo ? '#003F7F' : '#fff',
                  borderColor:  modoOrden === modo ? '#003F7F' : '#e2e8f0',
                  color:        modoOrden === modo ? '#fff' : '#6b7280',
                }}
              >
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
              items={listaActual.map((p, i) => p.etiqueta + i)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                {listaActual.map((p, i) => (
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
  )
}