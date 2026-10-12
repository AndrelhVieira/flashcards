import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearLegacyCards, loadLegacyCards, parseCards, readCardsFile } from './storage'
import { makeCard } from '../test/fixtures'

describe('parseCards', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 12, 12))
  })

  afterEach(() => vi.useRealTimers())

  it('rejeita formatos que não são lista', () => {
    expect(() => parseCards({})).toThrow()
    expect(() => parseCards(null)).toThrow()
  })

  it('mantém cards válidos sem alterações', () => {
    const card = makeCard()
    expect(parseCards([card])).toEqual([card])
  })

  it('descarta itens sem título ou descrição', () => {
    const result = parseCards([
      makeCard(),
      { title: '   ', description: 'x' },
      { title: 'Sem descrição' },
      'texto solto',
      null,
    ])
    expect(result).toHaveLength(1)
  })

  it('completa campos ausentes com valores padrão', () => {
    const [card] = parseCards([{ title: 'T', description: 'D' }])
    expect(card).toMatchObject({
      id: '',
      intervalDays: 1,
      nextReview: '2026-10-12',
      lastReviewedAt: null,
      reviewCount: 0,
    })
    expect(card.createdAt).toBe(new Date(2026, 9, 12, 12).toISOString())
  })

  it('normaliza valores fora dos limites aceitos pelo Firestore', () => {
    const [card] = parseCards([
      {
        id: 'path/injetado',
        title: 'x'.repeat(500),
        description: 'y'.repeat(20_000),
        intervalDays: 9999,
        nextReview: '12/10/2026',
        reviewCount: -3,
      },
    ])
    expect(card.id).toBe('')
    expect(card.title).toHaveLength(200)
    expect(card.description).toHaveLength(10_000)
    expect(card.intervalDays).toBe(365)
    expect(card.nextReview).toBe('2026-10-12')
    expect(card.reviewCount).toBe(0)
  })

  it('usa intervalo 1 para valores inválidos', () => {
    const cards = parseCards([
      { title: 'a', description: 'b', intervalDays: 0 },
      { title: 'a', description: 'b', intervalDays: 2.5 },
      { title: 'a', description: 'b', intervalDays: 'abc' },
    ])
    expect(cards.map((c) => c.intervalDays)).toEqual([1, 1, 1])
  })
})

describe('backup em arquivo', () => {
  it('lê um backup JSON exportado', async () => {
    const file = new File([JSON.stringify([makeCard()])], 'backup.json')
    await expect(readCardsFile(file)).resolves.toEqual([makeCard()])
  })

  it('falha com JSON inválido', async () => {
    const file = new File(['não é json'], 'backup.json')
    await expect(readCardsFile(file)).rejects.toThrow()
  })
})

describe('cards legados do localStorage', () => {
  afterEach(() => localStorage.clear())

  it('carrega e limpa os cards da versão sem login', () => {
    localStorage.setItem('flashcards:v1', JSON.stringify([makeCard()]))
    expect(loadLegacyCards()).toHaveLength(1)
    clearLegacyCards()
    expect(loadLegacyCards()).toEqual([])
  })

  it('ignora conteúdo corrompido', () => {
    localStorage.setItem('flashcards:v1', '{corrompido')
    expect(loadLegacyCards()).toEqual([])
  })
})
