export interface Flashcard {
  id: string
  title: string
  description: string
  /** Intervalo atual (em dias) até a próxima revisão. */
  intervalDays: number
  /** Data local no formato YYYY-MM-DD. */
  nextReview: string
  createdAt: string
  lastReviewedAt: string | null
  reviewCount: number
  /** Ids das categorias do card (pode estar vazio). */
  categoryIds: string[]
}

export type FlashcardInput = Pick<Flashcard, 'title' | 'description' | 'intervalDays' | 'categoryIds'>

export interface Category {
  id: string
  name: string
  createdAt: string
}

/** Limites também validados nas regras do Firestore. */
export const MAX_CATEGORY_NAME = 50
export const MAX_CATEGORIES_PER_CARD = 20
