import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import {
  clearIndexedDbPersistence,
  initializeFirestore,
  terminate,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

const app = isFirebaseConfigured ? initializeApp(config) : null

export const auth = app ? getAuth(app) : null

// Cache persistente: o app continua funcionando offline e sincroniza ao reconectar.
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  : null

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

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
