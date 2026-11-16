import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Beklenmeyen bir ekran hatası bütün paneli beyaz sayfaya çevirmesin: anlaşılır mesaj ve yeniden yükleme düğmesi gösterilir.
class Guard extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  componentDidCatch(e: unknown) { console.error('ekran hatası:', e) }
  render() {
    if (!this.state.err) return this.props.children
    return (
      <div role="alert" style={{ maxWidth: 480, margin: '15vh auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Bir şeyler ters gitti</h1>
        <p style={{ margin: '0 0 16px', color: '#52514e' }}>Bu ekran açılamadı. Taslakta veriler örnektir; sayfayı yenileyince başlangıç durumuna döner.</p>
        <button onClick={() => { location.hash = '#/overview'; location.reload() }} style={{ height: 40, padding: '0 16px', borderRadius: 8, border: '1px solid #3048c8', background: '#3048c8', color: '#fff', fontSize: 15 }}>Genel bakışa dön</button>
      </div>
    )
  }
}

createRoot(document.getElementById('root')!).render(<StrictMode><Guard><App /></Guard></StrictMode>)
