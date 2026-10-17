import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type CollectionReference,
} from 'firebase/firestore'
import type { Category, Flashcard } from '../types'
import { db } from '../lib/firebase'
import { useI18n } from '../i18n/context'

type CategoryData = Omit<Category, 'id'>

const BATCH_LIMIT = 450

export function useCategories(uid: string) {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [syncFailed, setSyncFailed] = useState(false)

  // Mesma estratégia do useCards: a UI reflete o snapshot local, erros só são avisados.
  const fireAndForget = useCallback((promise: Promise<unknown>) => {
    promise.catch((err) => {
      console.error('Falha ao sincronizar categoria', err)
      setSyncFailed(true)
    })
  }, [])

  const categoriesRef = useMemo(
    () => collection(db!, 'users', uid, 'categories') as CollectionReference<CategoryData>,
    [uid],
  )
  const cardsRef = useMemo(() => collection(db!, 'users', uid, 'cards'), [uid])

  useEffect(
    () =>
      onSnapshot(
        categoriesRef,
        (snap) => {
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }))
          setCategories(list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
        },
        (err) => console.error(err),
      ),
    [categoriesRef],
  )

  /** Cria a categoria e devolve o id, já disponível para uso offline. */
  const addCategory = useCallback(
    (name: string) => {
      const ref = doc(categoriesRef)
      fireAndForget(setDoc(ref, { name, createdAt: new Date().toISOString() }))
      return ref.id
    },
    [categoriesRef, fireAndForget],
  )

  const renameCategory = useCallback(
    (id: string, name: string) => fireAndForget(updateDoc(doc(categoriesRef, id), { name })),
    [categoriesRef, fireAndForget],
  )

  /** Exclui a categoria e a remove dos cards que a usam (os cards são mantidos). */
  const deleteCategory = useCallback(
    (id: string, cards: Flashcard[]) => {
      // Escrita própria: se um card já tiver sido excluído em outro aparelho, a falha
      // da limpeza não desfaz a exclusão. Ids órfãos que sobrarem são ignorados pela UI.
      fireAndForget(deleteDoc(doc(categoriesRef, id)))
      const affected = cards.filter((c) => c.categoryIds.includes(id))
      for (let i = 0; i < affected.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db!)
        for (const card of affected.slice(i, i + BATCH_LIMIT)) {
          batch.update(doc(cardsRef, card.id), { categoryIds: arrayRemove(id) })
        }
        fireAndForget(batch.commit())
      }
    },
    [categoriesRef, cardsRef, fireAndForget],
  )

  /** Importa categorias de um backup, mantendo os ids para preservar os vínculos. */
  const importCategories = useCallback(
    (incoming: Category[]) => {
      for (let i = 0; i < incoming.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db!)
        for (const { id, ...data } of incoming.slice(i, i + BATCH_LIMIT)) {
          batch.set(doc(categoriesRef, id), data)
        }
        fireAndForget(batch.commit())
      }
    },
    [categoriesRef, fireAndForget],
  )

  const dismissSyncError = useCallback(() => setSyncFailed(false), [])
  const syncError = syncFailed ? t.sync.categoriesSave : null

  return { categories, syncError, dismissSyncError, addCategory, renameCategory, deleteCategory, importCategories }
}
