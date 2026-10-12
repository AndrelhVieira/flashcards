import { useAuth } from './hooks/useAuth'
import { isFirebaseConfigured } from './lib/firebase'
import { Dashboard } from './components/Dashboard'
import { LoginScreen } from './components/LoginScreen'

export default function App() {
  const { user, loading, error, signIn, logOut } = useAuth()

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

  if (loading) return <div className="spinner spinner--page" aria-label="Carregando" />
  if (!user) return <LoginScreen onSignIn={signIn} error={error} />
  return <Dashboard key={user.uid} user={user} onLogout={logOut} />
}
