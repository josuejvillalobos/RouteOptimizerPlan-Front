import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDebounce } from 'use-debounce'
import { SearchOutlined, LoadingOutlined, EnvironmentOutlined, ShopOutlined, HomeOutlined } from '@ant-design/icons'
import { buscarDirecciones, type NominatimResult } from '../services/api'
import type { Stop } from '../types/routeTypes'

interface Props {
  placeholder: string
  onSelect: (stop: Stop) => void
}

function getIcon(r: NominatimResult) {
  const s = (r.category || '') + ' ' + (r.type || '')
  if (/restaurant|cafe|bar|fast_food|food|shop|pharmacy|hospital|school|bank|hotel|amenity/.test(s))
    return <ShopOutlined style={{ fontSize: 11 }} />
  if (/house|building|residential/.test(s))
    return <HomeOutlined style={{ fontSize: 11 }} />
  return <EnvironmentOutlined style={{ fontSize: 11 }} />
}

export default function SearchBox({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 380)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Calcular posicion del dropdown en coordenadas de viewport (fixed)
  function updatePos() {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
    }
  }

  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    buscarDirecciones(debouncedQuery)
      .then(r => { setResults(r); setOpen(true); updatePos() })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const target = e.target as Node
      const dropdown = document.getElementById('search-dropdown-portal')
      if (
        wrapperRef.current && !wrapperRef.current.contains(target) &&
        dropdown && !dropdown.contains(target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Actualizar posicion al hacer scroll del panel
  useEffect(() => {
    if (!open) return
    const panel = document.getElementById('route-panel-scroll')
    panel?.addEventListener('scroll', updatePos)
    window.addEventListener('resize', updatePos)
    return () => {
      panel?.removeEventListener('scroll', updatePos)
      window.removeEventListener('resize', updatePos)
    }
  }, [open])

  function handleSelect(r: NominatimResult) {
    const primary = r.display_name.split(',')[0].trim()
    onSelect({
      etiqueta: primary,
      calle: r.display_name,
      latitud: parseFloat(r.lat),
      longitud: parseFloat(r.lon),
    })
    setQuery(''); setResults([]); setOpen(false)
  }

  const dropdown = open ? createPortal(
    <div
      id="search-dropdown-portal"
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 99999,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        overflow: 'hidden',
      }}
    >
      {results.length > 0 && (
        <>
          <div style={{
            padding: '7px 12px', background: '#f9fafb',
            borderBottom: '1px solid #f3f4f6',
            fontSize: 10, fontWeight: 700, color: '#9ca3af',
            letterSpacing: 0.8, textTransform: 'uppercase',
          }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </div>
          {/* 3.5 items visibles = ~196px, luego scrollbar */}
          <div style={{
            maxHeight: 196,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent',
          }}>
            {results.map((r, idx) => {
              const primary = r.display_name.split(',')[0].trim()
              const secondary = r.display_name.split(',').slice(1, 3).join(',').trim()
              return (
                <button
                  key={r.place_id}
                  onMouseDown={e => { e.preventDefault(); handleSelect(r) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', background: 'transparent',
                    border: 'none', borderBottom: idx < results.length - 1 ? '1px solid #f9fafb' : 'none',
                    cursor: 'pointer', textAlign: 'left', minHeight: 56, transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#EBF5FF', color: '#1A7FC1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {getIcon(r)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {primary}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {secondary || 'Aguascalientes, Mexico'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
      {results.length === 0 && !loading && debouncedQuery.length >= 2 && (
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Sin resultados para "{debouncedQuery}"</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Intenta con nombre completo, colonia o calle</div>
        </div>
      )}
    </div>,
    document.body
  ) : null

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: `1.5px solid ${open ? '#1A7FC1' : '#e5e7eb'}`,
        borderRadius: 12, padding: '8px 12px',
        boxShadow: open ? '0 0 0 3px rgba(26,127,193,0.1)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.15s',
      }}>
        {loading
          ? <LoadingOutlined style={{ color: '#1A7FC1', fontSize: 13, flexShrink: 0 }} spin />
          : <SearchOutlined style={{ color: '#9ca3af', fontSize: 13, flexShrink: 0 }} />
        }
        <input
          ref={inputRef}
          style={{ flex: 1, fontSize: 13, color: '#111827', background: 'transparent', border: 'none', outline: 'none', minWidth: 0 }}
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); updatePos() }}
          onFocus={() => { updatePos(); results.length > 0 && setOpen(true) }}
        />
        {query && (
          <button
            onMouseDown={e => { e.preventDefault(); setQuery(''); setResults([]); setOpen(false) }}
            style={{
              background: '#f3f4f6', border: 'none', borderRadius: '50%',
              width: 18, height: 18, cursor: 'pointer', fontSize: 10,
              color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>✕</button>
        )}
      </div>
      {dropdown}
    </div>
  )
}