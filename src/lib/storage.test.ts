import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearLegacyCards,
  loadLegacyCards,
  loadStudyFilter,
  parseBackup,
  parseCards,
  readBackupFile,
  saveStudyFilter,
} from './storage'
import { makeCard, makeCategory } from '../test/fixtures'

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

  it('mantém só ids de categoria válidos, sem repetição', () => {
    const [card] = parseCards([
      { title: 'a', description: 'b', categoryIds: ['js', 'js', 'a/b', 3, ...Array.from({ length: 30 }, (_, i) => `c${i}`)] },
    ])
    expect(card.categoryIds[0]).toBe('js')
    expect(card.categoryIds).toHaveLength(20)
    expect(card.categoryIds).not.toContain('a/b')
    expect(parseCards([{ title: 'a', description: 'b' }])[0].categoryIds).toEqual([])
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

describe('parseBackup', () => {
  it('aceita o formato antigo, só com a lista de cards', () => {
    expect(parseBackup([makeCard()])).toEqual({ cards: [makeCard()], categories: [] })
  })

  it('lê cards e categorias do formato atual', () => {
    const backup = { version: 2, categories: [makeCategory()], cards: [makeCard({ categoryIds: ['cat-1'] })] }
    expect(parseBackup(backup)).toEqual({ cards: backup.cards, categories: backup.categories })
  })

  it('descarta categorias sem id válido ou sem nome e limita o nome', () => {
    const { categories } = parseBackup({
      cards: [],
      categories: [{ name: 'Sem id' }, { id: 'a/b', name: 'x' }, { id: 'vazia', name: '  ' }, { id: 'ok', name: ` ${'x'.repeat(80)} ` }],
    })
    expect(categories).toHaveLength(1)
    expect(categories[0].name).toHaveLength(50)
  })

  it('rejeita formatos desconhecidos', () => {
    expect(() => parseBackup(null)).toThrow()
    expect(() => parseBackup({ categories: [] })).toThrow()
  })
})

describe('backup em arquivo', () => {
  it('lê um backup JSON exportado', async () => {
    const file = new File([JSON.stringify({ version: 2, categories: [], cards: [makeCard()] })], 'backup.json')
    await expect(readBackupFile(file)).resolves.toEqual({ cards: [makeCard()], categories: [] })
  })

  it('falha com JSON inválido', async () => {
    const file = new File(['não é json'], 'backup.json')
    await expect(readBackupFile(file)).rejects.toThrow()
  })
})

describe('filtro de categorias do estudo', () => {
  afterEach(() => localStorage.clear())

  it('salva por usuário e limpa quando vazio', () => {
    saveStudyFilter('u1', ['js'])
    expect(loadStudyFilter('u1')).toEqual(['js'])
    expect(loadStudyFilter('u2')).toEqual([])
    saveStudyFilter('u1', [])
    expect(localStorage.getItem('flashcards:study-categories:u1')).toBeNull()
  })

  it('ignora conteúdo corrompido', () => {
    localStorage.setItem('flashcards:study-categories:u1', '{x')
    expect(loadStudyFilter('u1')).toEqual([])
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
