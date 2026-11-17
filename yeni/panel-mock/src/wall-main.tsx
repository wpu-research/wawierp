// Duvar ekranı paketi (/tv): şifresiz açılır; yalnız Wall ve veri sağlayıcısını içerir (panel, asistan, sohbet yok).
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { StoreProvider } from './store'
import Wall from './pages/Wall'

function Root() {
  useEffect(() => { document.documentElement.dataset.theme = 'dark' }, [])
  return <Wall />
}
createRoot(document.getElementById('root')!).render(<StrictMode><StoreProvider><Root /></StoreProvider></StrictMode>)
