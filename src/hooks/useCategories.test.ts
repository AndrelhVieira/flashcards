import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCard, makeCategory } from '../test/fixtures'

const fs = vi.hoisted(() => ({
  snapshotCallback: null as null | ((snap: unknown) => void),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  batchSet: vi.fn(),
  batchUpdate: vi.fn(),
  batchCommit: vi.fn(() => Promise.resolve()),
}))

vi.mock('../lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, ...path: string[]) => ({ path: path.join('/') }),
  doc: (ref: { path: string }, id = 'auto-id') => ({ path: `${ref.path}/${id}`, id }),
  onSnapshot: (_ref: unknown, next: (snap: unknown) => void) => {
    fs.snapshotCallback = next
    return () => {}
  },
  arrayRemove: (value: string) => ({ arrayRemove: value }),
  setDoc: fs.setDoc,
  updateDoc: fs.updateDoc,
  deleteDoc: fs.deleteDoc,
  writeBatch: () => ({ set: fs.batchSet, update: fs.batchUpdate, commit: fs.batchCommit }),
}))

const { useCategories } = await import('./useCategories')

describe('useCategories', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 12, 12))
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => vi.useRealTimers())

  it('carrega as categorias ordenadas por nome', () => {
    const { result } = renderHook(() => useCategories('uid-1'))
    const list = [makeCategory({ id: 'b', name: 'react' }), makeCategory({ id: 'a', name: 'Álgebra' })]
    act(() => fs.snapshotCallback!({ docs: list.map(({ id, ...data }) => ({ id, data: () => data })) }))
    expect(result.current.categories.map((c) => c.name)).toEqual(['Álgebra', 'react'])
  })

  it('cria e renomeia categorias', () => {
    const { result } = renderHook(() => useCategories('uid-1'))
    let id = ''
    act(() => {
      id = result.current.addCategory('JS')
    })
    expect(id).toBe('auto-id')
    expect(fs.setDoc).toHaveBeenCalledWith(
      { path: 'users/uid-1/categories/auto-id', id: 'auto-id' },
      { name: 'JS', createdAt: new Date(2026, 9, 12, 12).toISOString() },
    )

    act(() => result.current.renameCategory('js', 'JavaScript'))
    expect(fs.updateDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'js' }), { name: 'JavaScript' })
  })

  it('ao excluir, remove a categoria só dos cards que a usam', () => {
    const { result } = renderHook(() => useCategories('uid-1'))
    const cards = [
      makeCard({ id: 'a', categoryIds: ['js', 'react'] }),
      makeCard({ id: 'b', categoryIds: ['react'] }),
    ]
    act(() => result.current.deleteCategory('js', cards))

    expect(fs.deleteDoc).toHaveBeenCalledWith({ path: 'users/uid-1/categories/js', id: 'js' })
    expect(fs.batchUpdate).toHaveBeenCalledTimes(1)
    expect(fs.batchUpdate).toHaveBeenCalledWith(
      { path: 'users/uid-1/cards/a', id: 'a' },
      { categoryIds: { arrayRemove: 'js' } },
    )
    expect(fs.batchCommit).toHaveBeenCalledTimes(1)
  })

  it('divide a limpeza em lotes quando muitos cards usam a categoria', () => {
    const { result } = renderHook(() => useCategories('uid-1'))
    const cards = Array.from({ length: 1000 }, (_, i) => makeCard({ id: `c${i}`, categoryIds: ['js'] }))
    act(() => result.current.deleteCategory('js', cards))

    expect(fs.deleteDoc).toHaveBeenCalledTimes(1)
    expect(fs.batchUpdate).toHaveBeenCalledTimes(1000)
    expect(fs.batchCommit).toHaveBeenCalledTimes(3)
  })

  it('exclui a categoria mesmo sem cards para limpar', () => {
    const { result } = renderHook(() => useCategories('uid-1'))
    act(() => result.current.deleteCategory('js', [makeCard({ categoryIds: ['react'] })]))
    expect(fs.deleteDoc).toHaveBeenCalledTimes(1)
    expect(fs.batchCommit).not.toHaveBeenCalled()
  })

  it('a falha na limpeza dos cards não desfaz a exclusão da categoria', async () => {
    fs.batchCommit.mockReturnValueOnce(Promise.reject(new Error('not-found')))
    const { result } = renderHook(() => useCategories('uid-1'))
    act(() => result.current.deleteCategory('js', [makeCard({ categoryIds: ['js'] })]))

    expect(fs.deleteDoc).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(result.current.syncError).not.toBeNull())
  })

  it('importa mantendo os ids e sem gravar o campo id', () => {
    const { result } = renderHook(() => useCategories('uid-1'))
    act(() => result.current.importCategories([makeCategory({ id: 'js' })]))
    const [ref, data] = fs.batchSet.mock.calls[0] as unknown as [{ id: string }, object]
    expect(ref.id).toBe('js')
    expect(data).not.toHaveProperty('id')
  })

  it('avisa quando o servidor rejeita uma gravação', async () => {
    fs.setDoc.mockReturnValueOnce(Promise.reject(new Error('permission-denied')))
    const { result } = renderHook(() => useCategories('uid-1'))
    act(() => {
      result.current.addCategory('x'.repeat(60))
    })
    await waitFor(() => expect(result.current.syncError).toMatch(/categorias/i))
    act(() => result.current.dismissSyncError())
    expect(result.current.syncError).toBeNull()
  })
})
