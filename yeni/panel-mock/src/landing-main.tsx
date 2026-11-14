import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './pages/Landing'

function Root() {
  const [dark, setDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  return <Landing dark={dark} setDark={setDark} />
}
createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>)
