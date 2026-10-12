import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth, clearLocalCache, googleProvider } from '../lib/firebase'

const IGNORED_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async () => {
    if (!auth) return
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err instanceof FirebaseError && IGNORED_ERRORS.has(err.code)) return
      console.error(err)
      setError('Não foi possível entrar com o Google. Tente novamente.')
    }
  }, [])

  const logOut = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
    await clearLocalCache()
    // O Firestore encerrado não pode ser reaberto; recarrega para um estado limpo.
    window.location.reload()
  }, [])

  return { user, loading, error, signIn, logOut }
}
