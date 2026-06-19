import { useEffect } from 'react'
import RoutePanel from './components/RoutePanel'
import MapView from './components/MapView'
import { useRouteStore } from './store/routeStore'
import { pingBackend } from './services/api'

export default function App() {
  const setBackendOk = useRouteStore((s) => s.setBackendOk)

  useEffect(() => {
    pingBackend().then(setBackendOk)
    const interval = setInterval(() => pingBackend().then(setBackendOk), 10000)
    return () => clearInterval(interval)
  }, [setBackendOk])

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <MapView />
      <RoutePanel />
    </div>
  )
}