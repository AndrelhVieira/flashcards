import {
  clearIndexedDbPersistence,
  initializeFirestore,
  terminate,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { app } from './auth'

export { auth, googleProvider, isFirebaseConfigured } from './auth'

// Cache persistente: o app continua funcionando offline e sincroniza ao reconectar.
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  : null

/** Apaga o cache offline do Firestore (dados do usuário que saiu ficam fora do aparelho). */
export async function clearLocalCache() {
  if (!db) return
  try {
    await terminate(db)
    await clearIndexedDbPersistence(db)
  } catch (err) {
    // Falha se outra aba ainda usa o cache; ela será limpa no próximo logout.
    console.warn('Não foi possível limpar o cache local', err)
  }
}
