import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from 'firebase/auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCard, makeCategory } from '../test/fixtures'
import type { useCards } from '../hooks/useCards'
import type { useCategories } from '../hooks/useCategories'

type CardsState = ReturnType<typeof useCards>
type CategoriesState = ReturnType<typeof useCategories>

const state = vi.hoisted(() => ({
  current: null as unknown as CardsState,
  categories: null as unknown as CategoriesState,
}))
vi.mock('../hooks/useCards', () => ({ useCards: () => state.current }))
vi.mock('../hooks/useCategories', () => ({ useCategories: () => state.categories }))

const { Dashboard } = await import('./Dashboard')

const user = { uid: 'u1', displayName: 'Ana', email: 'ana@example.com', photoURL: null } as unknown as User

function mockCategories(overrides: Partial<CategoriesState> = {}) {
  state.categories = {
    categories: [],
    syncError: null,
    dismissSyncError: vi.fn(),
    addCategory: vi.fn(() => 'new-id'),
    renameCategory: vi.fn(),
    deleteCategory: vi.fn(),
    importCategories: vi.fn(),
    ...overrides,
  }
  return state.categories
}

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
    mockCategories()
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

  describe('revisão por categorias', () => {
    const categories = [
      makeCategory({ id: 'js', name: 'JavaScript' }),
      makeCategory({ id: 'react', name: 'React' }),
      makeCategory({ id: 'sql', name: 'SQL' }),
    ]

    function setupCategories() {
      mockCategories({ categories })
      mockCards({
        cards: [
          makeCard({ id: 'a', title: 'Closure', nextReview: '2026-10-10', categoryIds: ['js'] }),
          makeCard({ id: 'b', title: 'Hooks', nextReview: '2026-10-11', categoryIds: ['react'] }),
          makeCard({ id: 'c', title: 'Join', nextReview: '2026-10-12', categoryIds: ['sql'] }),
          makeCard({ id: 'd', title: 'Futuro', nextReview: '2026-10-20', categoryIds: ['js'] }),
        ],
      })
      return render(<Dashboard user={user} onLogout={vi.fn()} />)
    }

    const filter = () => screen.getByRole('group', { name: 'Revisar categorias' })
    const remaining = () => screen.getByText(/restante/).textContent

    it('mostra quantos cards vencidos há em cada categoria', () => {
      setupCategories()
      expect(within(filter()).getByRole('button', { name: 'Todas 3' })).toHaveAttribute('aria-pressed', 'true')
      expect(within(filter()).getByRole('button', { name: 'JavaScript 1' })).toBeInTheDocument()
    })

    it('revisa só os vencidos das categorias escolhidas, combinando com OU', async () => {
      setupCategories()
      await userEvent.click(within(filter()).getByRole('button', { name: /react/i }))
      expect(remaining()).toBe('1 card restante')
      expect(screen.getByRole('heading', { name: 'Hooks', level: 2 })).toBeInTheDocument()

      await userEvent.click(within(filter()).getByRole('button', { name: /javascript/i }))
      expect(remaining()).toBe('2 cards restantes')
      expect(screen.getByRole('heading', { name: 'Closure', level: 2 })).toBeInTheDocument()
      // O contador da aba continua mostrando todos os vencidos.
      expect(screen.getByRole('tab', { name: /estudar/i })).toHaveTextContent('3')
    })

    it('lembra a seleção no aparelho e ignora categorias excluídas', async () => {
      localStorage.setItem('flashcards:study-categories:u1', JSON.stringify(['sql', 'removida']))
      setupCategories()
      expect(remaining()).toBe('1 card restante')
      expect(within(filter()).getByRole('button', { name: /sql/i })).toHaveAttribute('aria-pressed', 'true')

      await userEvent.click(within(filter()).getByRole('button', { name: /todas/i }))
      expect(remaining()).toBe('3 cards restantes')
      expect(localStorage.getItem('flashcards:study-categories:u1')).toBeNull()
    })

    it('não mostra o filtro quando não há categorias', () => {
      mockCards({ cards: [makeCard()] })
      render(<Dashboard user={user} onLogout={vi.fn()} />)
      expect(screen.queryByRole('group', { name: 'Revisar categorias' })).not.toBeInTheDocument()
    })
  })
})
