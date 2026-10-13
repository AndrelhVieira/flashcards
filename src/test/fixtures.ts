import type { Category, Flashcard } from '../types'

export function makeCard(overrides: Partial<Flashcard> = {}): Flashcard {
  return {
    id: 'card-1',
    title: 'O que é closure?',
    description: 'Função que lembra o escopo onde foi criada.',
    intervalDays: 3,
    nextReview: '2026-10-12',
    createdAt: '2026-10-01T10:00:00.000Z',
    lastReviewedAt: null,
    reviewCount: 0,
    categoryIds: [],
    ...overrides,
  }
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return { id: 'cat-1', name: 'JavaScript', createdAt: '2026-10-01T10:00:00.000Z', ...overrides }
}
