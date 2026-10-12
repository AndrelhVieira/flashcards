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
}

export type FlashcardInput = Pick<Flashcard, 'title' | 'description' | 'intervalDays'>
