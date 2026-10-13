import { render, screen, waitFor, within } from '@testing-library/react'
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

const storage = vi.hoisted(() => ({ exportBackup: vi.fn() }))
vi.mock('../lib/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/storage')>()),
  exportBackup: storage.exportBackup,
}))

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
    vi.restoreAllMocks()
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

  describe('backup e categorias', () => {
    const category = makeCategory({ id: 'js', name: 'JavaScript' })
    const card = makeCard({ id: 'a', categoryIds: ['js'] })

    function backupFile(content: unknown) {
      return new File([JSON.stringify(content)], 'backup.json', { type: 'application/json' })
    }

    async function importFile(file: File) {
      const { container } = render(<Dashboard user={user} onLogout={vi.fn()} />)
      await userEvent.upload(container.querySelector<HTMLInputElement>('input[type="file"]')!, file)
    }

    it('exporta cards e categorias', async () => {
      mockCategories({ categories: [category] })
      mockCards({ cards: [card] })
      render(<Dashboard user={user} onLogout={vi.fn()} />)

      await userEvent.click(screen.getByLabelText('Menu da conta'))
      await userEvent.click(screen.getByRole('button', { name: 'Exportar backup' }))
      expect(storage.exportBackup).toHaveBeenCalledWith([card], [category])
    })

    it('importa cards e categorias após confirmação', async () => {
      const categories = mockCategories()
      const cards = mockCards()
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

      await importFile(backupFile({ version: 2, categories: [category], cards: [card] }))

      await waitFor(() => expect(cards.importCards).toHaveBeenCalledWith([card]))
      expect(categories.importCategories).toHaveBeenCalledWith([category])
      expect(confirm).toHaveBeenCalledWith(expect.stringContaining('1 cards e 1 categorias'))
    })

    it('importa backups antigos, só com cards', async () => {
      const categories = mockCategories()
      const cards = mockCards()
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      await importFile(backupFile([card]))

      await waitFor(() => expect(cards.importCards).toHaveBeenCalledWith([card]))
      expect(categories.importCategories).toHaveBeenCalledWith([])
    })

    it('não importa nada se o usuário cancelar', async () => {
      const categories = mockCategories()
      const cards = mockCards()
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)

      await importFile(backupFile([card]))

      await waitFor(() => expect(confirm).toHaveBeenCalled())
      expect(cards.importCards).not.toHaveBeenCalled()
      expect(categories.importCategories).not.toHaveBeenCalled()
    })

    it('avisa quando o arquivo é inválido', async () => {
      mockCards()
      const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})

      await importFile(new File(['não é json'], 'backup.json', { type: 'application/json' }))

      await waitFor(() => expect(alert).toHaveBeenCalledWith(expect.stringMatching(/arquivo inválido/i)))
    })

    it('ao excluir uma categoria, passa os cards para a limpeza', async () => {
      const categories = mockCategories({ categories: [category] })
      mockCards({ cards: [card] })
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<Dashboard user={user} onLogout={vi.fn()} />)

      await userEvent.click(screen.getByRole('tab', { name: /meus cards/i }))
      await userEvent.click(screen.getByText('Categorias', { selector: 'summary' }))
      await userEvent.click(screen.getByRole('button', { name: 'Excluir JavaScript' }))
      expect(categories.deleteCategory).toHaveBeenCalledWith('js', [card])
    })

    it('mostra erro de sincronização das categorias e fecha os dois avisos', async () => {
      const categories = mockCategories({ syncError: 'Falhou categoria' })
      const cards = mockCards()
      render(<Dashboard user={user} onLogout={vi.fn()} />)

      expect(screen.getByRole('alert')).toHaveTextContent('Falhou categoria')
      await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
      expect(categories.dismissSyncError).toHaveBeenCalled()
      expect(cards.dismissSyncError).toHaveBeenCalled()
    })
  })
})
