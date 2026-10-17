import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth, clearLocalCache } from '../lib/firebase'

/** O login acontece na landing page; aqui o app só acompanha a sessão e faz o logout. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const logOut = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
    await clearLocalCache()
    // O Firestore encerrado não pode ser reaberto; a navegação também recarrega o estado.
    window.location.replace('/')
  }, [])

  return { user, loading, logOut }
}
