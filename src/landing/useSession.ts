import { useCallback, useEffect, useState } from 'react'

export const APP_URL = '/app/'

const IGNORED_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

// O login (Firebase Auth) fica fora do bundle inicial da landing. O download começa assim que a
// página monta, então no clique ele já está pronto e o popup abre dentro do gesto do usuário.
const loadAuth = () => import('./firebaseAuth')

function isIgnored(err: unknown) {
  return typeof err === 'object' && err !== null && 'code' in err && IGNORED_ERRORS.has(String(err.code))
}

export function useSession() {
  /** `null` enquanto a sessão ainda está sendo verificada. */
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    loadAuth()
      .then((m) => {
        if (!cancelled) unsubscribe = m.watchSession(setSignedIn)
      })
      .catch((err) => console.error(err))
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  /** Leva ao app, pedindo o login do Google antes quando não há sessão. */
  const enter = useCallback(async () => {
    setError(false)
    try {
      const m = await loadAuth()
      if (!(await m.hasSession())) await m.signIn()
      window.location.assign(APP_URL)
    } catch (err) {
      if (isIgnored(err)) return
      console.error(err)
      setError(true)
    }
  }, [])

  return { signedIn, error, enter }
}
