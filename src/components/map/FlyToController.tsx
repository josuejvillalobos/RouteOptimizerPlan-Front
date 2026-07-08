import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useRouteStore } from '../../store/routeStore'

export default function FlyToController() {
  const { flyTo, clearFlyTo } = useRouteStore()
  const map = useMap()

  useEffect(() => {
    if (!flyTo) return
    map.flyTo([flyTo.lat, flyTo.lon], flyTo.zoom ?? 17, { duration: 1.2 })
    clearFlyTo()
  }, [flyTo])

  return null
}