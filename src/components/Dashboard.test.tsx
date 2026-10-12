import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from 'firebase/auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCard } from '../test/fixtures'
import type { useCards } from '../hooks/useCards'

type CardsState = ReturnType<typeof useCards>

const state = vi.hoisted(() => ({ current: null as unknown as CardsState }))
vi.mock('../hooks/useCards', () => ({ useCards: () => state.current }))

const { Dashboard } = await import('./Dashboard')

const user = { uid: 'u1', displayName: 'Ana', email: 'ana@example.com', photoURL: null } as unknown as User

function mockCards(overrides: Partial<CardsState> = {}) {
  state.current = {
    cards: [],
    loading: false,
    error: null,
    syncError: null,
    dismissSyncError: vi.fn(),
    addCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    reviewCard: vi.fn(),
    studyNow: vi.fn(),
    importCards: vi.fn(),
    ...overrides,
  }
  return state.current
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 12, 12))
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('mostra apenas os cards vencidos na aba Estudar', () => {
    mockCards({
      cards: [
        makeCard({ id: 'a', title: 'Vencido', nextReview: '2026-10-12' }),
        makeCard({ id: 'b', title: 'Futuro', nextReview: '2026-10-20' }),
      ],
    })
    render(<Dashboard user={user} onLogout={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /estudar/i })).toHaveTextContent('1')
    expect(screen.getByRole('heading', { name: 'Vencido', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('Futuro')).not.toBeInTheDocument()
  })

  it('alterna para a aba de cards', async () => {
    mockCards()
    render(<Dashboard user={user} onLogout={vi.fn()} />)
    await userEvent.click(screen.getByRole('tab', { name: /meus cards/i }))
    expect(screen.getByRole('heading', { name: 'Novo flashcard' })).toBeInTheDocument()
  })

  it('oferece importar os cards da versão sem login', async () => {
    const legacy = [makeCard({ id: 'old' })]
    localStorage.setItem('flashcards:v1', JSON.stringify(legacy))
    const cards = mockCards()
    render(<Dashboard user={user} onLogout={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Importar' }))
    expect(cards.importCards).toHaveBeenCalledWith(legacy)
    expect(localStorage.getItem('flashcards:v1')).toBeNull()
    expect(screen.queryByText(/encontramos/i)).not.toBeInTheDocument()
  })

  it('exibe erros de sincronização e de carregamento', async () => {
    const cards = mockCards({ syncError: 'Falhou ao salvar', error: 'Falhou ao carregar' })
    render(<Dashboard user={user} onLogout={vi.fn()} />)

    expect(screen.getByText('Falhou ao carregar')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(cards.dismissSyncError).toHaveBeenCalled()
  })

  it('aciona o logout pelo menu do usuário', async () => {
    mockCards()
    const onLogout = vi.fn()
    render(<Dashboard user={user} onLogout={onLogout} />)

    await userEvent.click(screen.getByLabelText('Menu da conta'))
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(onLogout).toHaveBeenCalled()
  })
})
