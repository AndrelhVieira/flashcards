import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Landing } from './Landing'
import { APP_URL } from './useSession'
import './landing.css'

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Landing />
    </StrictMode>,
  )
}

// Instalações antigas do PWA abrem em "/": com sessão ativa, quem usa o app instalado vai direto
// para ele. Sem sessão a landing aparece normalmente, para entrar (o app manda para cá sem login).
if (window.matchMedia('(display-mode: standalone)').matches) {
  import('./firebaseAuth')
    .then((m) => m.hasSession())
    .then((signedIn) => (signedIn ? window.location.replace(APP_URL) : render()))
    .catch(render)
} else {
  render()
}
