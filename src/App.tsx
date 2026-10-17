import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useI18n } from './i18n/context'
import { isFirebaseConfigured } from './lib/firebase'
import { Dashboard } from './components/Dashboard'

export default function App() {
  const { user, loading, logOut } = useAuth()
  const { t } = useI18n()
  const signedOut = !loading && !user

  // Sem sessão o app não abre: o login fica na landing page.
  useEffect(() => {
    if (isFirebaseConfigured && signedOut) window.location.replace('/')
  }, [signedOut])

  if (!isFirebaseConfigured) {
    return (
      <main className="login">
        <h1>{t.config.title}</h1>
        <p className="muted">
          {t.config.before}
          <code>VITE_FIREBASE_*</code>
          {t.config.middle}
          <code>.env.example</code>
          {t.config.after}
        </p>
      </main>
    )
  }

  if (!user) return <div className="spinner spinner--page" aria-label={t.common.loading} />
  return <Dashboard key={user.uid} user={user} onLogout={logOut} />
}
