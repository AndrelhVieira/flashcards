import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/auth'

/** Avisa se há alguém logado agora e a cada mudança. */
export function watchSession(onChange: (signedIn: boolean) => void): () => void {
  if (!auth) {
    onChange(false)
    return () => {}
  }
  return onAuthStateChanged(auth, (user) => onChange(!!user))
}

export async function hasSession(): Promise<boolean> {
  if (!auth) return false
  await auth.authStateReady()
  return !!auth.currentUser
}

/** Abre o login do Google. Sem Firebase configurado não faz nada (o app mostra o aviso). */
export async function signIn(): Promise<void> {
  if (!auth) return
  await signInWithPopup(auth, googleProvider)
}
