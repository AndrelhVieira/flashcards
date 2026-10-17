import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { isFirebaseConfigured } from './lib/firebase'
import { Dashboard } from './components/Dashboard'

export default function App() {
  const { user, loading, logOut } = useAuth()
  const signedOut = !loading && !user

  // Sem sessão o app não abre: o login fica na landing page.
  useEffect(() => {
    if (isFirebaseConfigured && signedOut) window.location.replace('/')
  }, [signedOut])

  if (!isFirebaseConfigured) {
    return (
      <main className="login">
        <h1>Configuração pendente</h1>
        <p className="muted">
          Defina as variáveis <code>VITE_FIREBASE_*</code> (veja <code>.env.example</code> e o README).
        </p>
      </main>
    )
  }

  if (!user) return <div className="spinner spinner--page" aria-label="Carregando" />
  return <Dashboard key={user.uid} user={user} onLogout={logOut} />
}
