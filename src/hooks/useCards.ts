import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type CollectionReference,
} from 'firebase/firestore'
import type { Flashcard, FlashcardInput } from '../types'
import { addDays, today } from '../lib/dates'
import { db } from '../lib/firebase'

type CardData = Omit<Flashcard, 'id'>

const BATCH_LIMIT = 450

function toData({ id: _id, ...data }: Flashcard): CardData {
  return data
}

export function useCards(uid: string) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  /**
   * Escritas não são aguardadas: com o cache offline do Firestore a promise só
   * resolve quando o servidor confirma, mas a UI já é atualizada pelo snapshot local.
   * Se o servidor rejeitar, o snapshot desfaz a alteração e avisamos o usuário.
   */
  const fireAndForget = useCallback((promise: Promise<unknown>) => {
    promise.catch((err) => {
      console.error('Falha ao sincronizar card', err)
      setSyncError('Não foi possível salvar uma alteração. Verifique os dados e tente novamente.')
    })
  }, [])

  const cardsRef = useMemo(
    () => collection(db!, 'users', uid, 'cards') as CollectionReference<CardData>,
    [uid],
  )

  useEffect(() => {
    setLoading(true)
    return onSnapshot(
      cardsRef,
      (snap) => {
        // Cards criados antes das categorias não têm `categoryIds`.
        setCards(snap.docs.map((d) => ({ ...d.data(), categoryIds: d.data().categoryIds ?? [], id: d.id })))
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(err)
        setError('Não foi possível carregar seus cards.')
        setLoading(false)
      },
    )
  }, [cardsRef])

  const addCard = useCallback(
    (input: FlashcardInput) => {
      const data: CardData = {
        ...input,
        nextReview: addDays(input.intervalDays),
        createdAt: new Date().toISOString(),
        lastReviewedAt: null,
        reviewCount: 0,
      }
      fireAndForget(setDoc(doc(cardsRef), data))
    },
    [cardsRef, fireAndForget],
  )

  const updateCard = useCallback(
    (id: string, input: FlashcardInput) => {
      const current = cards.find((c) => c.id === id)
      if (!current) return
      // Alterar o intervalo reagenda a partir de hoje.
      const nextReview =
        current.intervalDays !== input.intervalDays ? addDays(input.intervalDays) : current.nextReview
      fireAndForget(updateDoc(doc(cardsRef, id), { ...input, nextReview }))
    },
    [cards, cardsRef, fireAndForget],
  )

  const deleteCard = useCallback(
    (id: string) => fireAndForget(deleteDoc(doc(cardsRef, id))),
    [cardsRef, fireAndForget],
  )

  /** Registra uma revisão e agenda a próxima para daqui a `days` dias. */
  const reviewCard = useCallback(
    (id: string, days: number) => {
      const current = cards.find((c) => c.id === id)
      if (!current) return
      fireAndForget(
        updateDoc(doc(cardsRef, id), {
          intervalDays: days,
          nextReview: addDays(days),
          lastReviewedAt: new Date().toISOString(),
          reviewCount: current.reviewCount + 1,
        }),
      )
    },
    [cards, cardsRef, fireAndForget],
  )

  const studyNow = useCallback(
    (id: string) => fireAndForget(updateDoc(doc(cardsRef, id), { nextReview: today() })),
    [cardsRef, fireAndForget],
  )

  /** Adiciona vários cards de uma vez (importação). Mantém o id quando existir. */
  const importCards = useCallback(
    (incoming: Flashcard[]) => {
      for (let i = 0; i < incoming.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db!)
        for (const card of incoming.slice(i, i + BATCH_LIMIT)) {
          batch.set(card.id ? doc(cardsRef, card.id) : doc(cardsRef), toData(card))
        }
        fireAndForget(batch.commit())
      }
    },
    [cardsRef, fireAndForget],
  )

  const dismissSyncError = useCallback(() => setSyncError(null), [])

  return { cards, loading, error, syncError, dismissSyncError, addCard, updateCard, deleteCard, reviewCard, studyNow, importCards }
}
