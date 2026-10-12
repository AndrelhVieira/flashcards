import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCard } from '../test/fixtures'

const fs = vi.hoisted(() => ({
  snapshotCallback: null as null | ((snap: unknown) => void),
  snapshotError: null as null | ((err: Error) => void),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  batchSet: vi.fn(),
  batchCommit: vi.fn(() => Promise.resolve()),
}))

vi.mock('../lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, ...path: string[]) => ({ path: path.join('/') }),
  doc: (ref: { path: string }, id = 'auto-id') => ({ path: `${ref.path}/${id}`, id }),
  onSnapshot: (_ref: unknown, next: (snap: unknown) => void, error: (err: Error) => void) => {
    fs.snapshotCallback = next
    fs.snapshotError = error
    return () => {}
  },
  setDoc: fs.setDoc,
  updateDoc: fs.updateDoc,
  deleteDoc: fs.deleteDoc,
  writeBatch: () => ({ set: fs.batchSet, commit: fs.batchCommit }),
}))

const { useCards } = await import('./useCards')

function emit(cards: ReturnType<typeof makeCard>[]) {
  act(() =>
    fs.snapshotCallback!({
      docs: cards.map(({ id, ...data }) => ({ id, data: () => data })),
    }),
  )
}

describe('useCards', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 12, 12))
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => vi.useRealTimers())

  it('carrega os cards do usuário a partir do snapshot', () => {
    const { result } = renderHook(() => useCards('uid-1'))
    expect(result.current.loading).toBe(true)

    emit([makeCard()])
    expect(result.current.loading).toBe(false)
    expect(result.current.cards).toEqual([makeCard()])
  })

  it('mostra erro quando a leitura é negada', () => {
    const { result } = renderHook(() => useCards('uid-1'))
    act(() => fs.snapshotError!(new Error('permission-denied')))
    expect(result.current.error).toMatch(/não foi possível carregar/i)
    expect(result.current.loading).toBe(false)
  })

  it('cria card agendado conforme o intervalo escolhido', () => {
    const { result } = renderHook(() => useCards('uid-1'))
    act(() => result.current.addCard({ title: 'T', description: 'D', intervalDays: 5 }))

    expect(fs.setDoc).toHaveBeenCalledWith(
      { path: 'users/uid-1/cards/auto-id', id: 'auto-id' },
      {
        title: 'T',
        description: 'D',
        intervalDays: 5,
        nextReview: '2026-10-17',
        createdAt: new Date(2026, 9, 12, 12).toISOString(),
        lastReviewedAt: null,
        reviewCount: 0,
      },
    )
  })

  it('registra a revisão incrementando o contador', () => {
    const { result } = renderHook(() => useCards('uid-1'))
    emit([makeCard({ reviewCount: 2 })])
    act(() => result.current.reviewCard('card-1', 7))

    expect(fs.updateDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-1' }), {
      intervalDays: 7,
      nextReview: '2026-10-19',
      lastReviewedAt: new Date(2026, 9, 12, 12).toISOString(),
      reviewCount: 3,
    })
  })

  it('ao editar, só reagenda se o intervalo mudar', () => {
    const { result } = renderHook(() => useCards('uid-1'))
    emit([makeCard({ intervalDays: 3, nextReview: '2026-10-14' })])

    act(() => result.current.updateCard('card-1', { title: 'Novo', description: 'D', intervalDays: 3 }))
    expect(fs.updateDoc).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ nextReview: '2026-10-14' }))

    act(() => result.current.updateCard('card-1', { title: 'Novo', description: 'D', intervalDays: 30 }))
    expect(fs.updateDoc).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ nextReview: '2026-11-11' }))
  })

  it('antecipa a revisão para hoje e exclui cards', () => {
    const { result } = renderHook(() => useCards('uid-1'))
    act(() => result.current.studyNow('card-1'))
    expect(fs.updateDoc).toHaveBeenCalledWith(expect.anything(), { nextReview: '2026-10-12' })

    act(() => result.current.deleteCard('card-1'))
    expect(fs.deleteDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-1' }))
  })

  it('importa em lotes, mantendo ids existentes e sem gravar o campo id', () => {
    const { result } = renderHook(() => useCards('uid-1'))
    const many = Array.from({ length: 1000 }, (_, i) => makeCard({ id: i === 0 ? '' : `c${i}` }))
    act(() => result.current.importCards(many))

    expect(fs.batchCommit).toHaveBeenCalledTimes(3)
    expect(fs.batchSet).toHaveBeenCalledTimes(1000)
    const [firstRef, firstData] = fs.batchSet.mock.calls[0] as unknown as [{ id: string }, object]
    expect(firstRef.id).toBe('auto-id')
    expect(firstData).not.toHaveProperty('id')
    expect((fs.batchSet.mock.calls[1] as unknown as [{ id: string }])[0].id).toBe('c1')
  })

  it('avisa quando o servidor rejeita uma gravação', async () => {
    fs.updateDoc.mockReturnValueOnce(Promise.reject(new Error('permission-denied')))
    const { result } = renderHook(() => useCards('uid-1'))
    act(() => result.current.studyNow('card-1'))

    await waitFor(() => expect(result.current.syncError).toMatch(/não foi possível salvar/i))
    act(() => result.current.dismissSyncError())
    expect(result.current.syncError).toBeNull()
  })
})
