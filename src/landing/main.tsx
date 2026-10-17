import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Landing } from './Landing'
import './landing.css'

// Instalações antigas do PWA abrem em "/": quem já usa o app como app instalado vai direto para ele.
if (window.matchMedia('(display-mode: standalone)').matches) {
  window.location.replace('/app/')
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Landing />
    </StrictMode>,
  )
}
