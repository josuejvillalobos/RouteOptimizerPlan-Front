import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { SegmentoVisual } from '../../types/routeTypes'

interface Props {
  segmentos: SegmentoVisual[]
}

export default function ArrowDecorator({ segmentos }: Props) {
  const map = useMap()

  useEffect(() => {
    const layers: L.Layer[] = []

    segmentos.forEach(seg => {
      if (seg.geometria.length < 2) return

      const polyline  = L.polyline(seg.geometria)
      const decorator = (L as any).polylineDecorator(polyline, {
        patterns: [{
          offset:  '15%',
          repeat:  '30%',
          symbol:  (L as any).Symbol.arrowHead({
            pixelSize:   10,
            polygon:     false,
            pathOptions: { color: seg.color, weight: 2.5, opacity: 0.9 },
          }),
        }],
      })

      decorator.addTo(map)
      layers.push(decorator)
    })

    return () => { layers.forEach(l => map.removeLayer(l)) }
  }, [segmentos, map])

  return null
}