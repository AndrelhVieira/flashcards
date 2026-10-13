import { MAX_CATEGORIES_PER_CARD, type Flashcard } from '../types'
import { MAX_INTERVAL, today } from './dates'

/** Chave usada pela versão sem login; lida apenas para migração. */
const LEGACY_KEY = 'flashcards:v1'

/** Ids aceitos pelo Firestore como nome de documento. */
const ID_PATTERN = /^[\w-]{1,128}$/

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && ID_PATTERN.test(value)
}

function normalize(value: unknown): Flashcard | null {
  if (typeof value !== 'object' || value === null) return null
  const c = value as Record<string, unknown>
  if (typeof c.title !== 'string' || typeof c.description !== 'string' || !c.title.trim()) return null
  const interval = Number(c.intervalDays)
  return {
    // Ids vazios ou inválidos para o Firestore geram um novo documento.
    id: isValidId(c.id) ? c.id : '',
    title: c.title.slice(0, 200),
    description: c.description.slice(0, 10_000),
    intervalDays: Number.isInteger(interval) ? Math.min(Math.max(interval, 1), MAX_INTERVAL) : 1,
    nextReview: typeof c.nextReview === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.nextReview) ? c.nextReview : today(),
    createdAt: typeof c.createdAt === 'string' ? c.createdAt.slice(0, 40) : new Date().toISOString(),
    lastReviewedAt: typeof c.lastReviewedAt === 'string' ? c.lastReviewedAt.slice(0, 40) : null,
    reviewCount: Number.isInteger(c.reviewCount) && (c.reviewCount as number) >= 0 ? (c.reviewCount as number) : 0,
    categoryIds: Array.isArray(c.categoryIds)
      ? [...new Set(c.categoryIds.filter(isValidId))].slice(0, MAX_CATEGORIES_PER_CARD)
      : [],
  }
}

export function parseCards(raw: unknown): Flashcard[] {
  if (!Array.isArray(raw)) throw new Error('Formato inválido: esperado uma lista de cards.')
  return raw.map(normalize).filter((c): c is Flashcard => c !== null)
}

export function loadLegacyCards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    return raw ? parseCards(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

export function clearLegacyCards(): void {
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Ignora: armazenamento indisponível.
  }
}

const studyFilterKey = (uid: string) => `flashcards:study-categories:${uid}`

/** Categorias escolhidas na aba Estudar, lembradas por usuário neste aparelho. */
export function loadStudyFilter(uid: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(studyFilterKey(uid)) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isValidId) : []
  } catch {
    return []
  }
}

export function saveStudyFilter(uid: string, ids: string[]): void {
  try {
    if (ids.length > 0) localStorage.setItem(studyFilterKey(uid), JSON.stringify(ids))
    else localStorage.removeItem(studyFilterKey(uid))
  } catch {
    // Ignora: armazenamento indisponível.
  }
}

export function exportCards(cards: Flashcard[]): void {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flashcards-${today()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readCardsFile(file: File): Promise<Flashcard[]> {
  return parseCards(JSON.parse(await file.text()))
}
