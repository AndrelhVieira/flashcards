import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CardList } from './CardList'
import { makeCard } from '../test/fixtures'

const cards = [
  makeCard({ id: 'b', title: 'React hooks', description: 'useState e useEffect', nextReview: '2026-10-20' }),
  makeCard({ id: 'a', title: 'Closure', description: 'Escopo léxico', nextReview: '2026-10-10' }),
]

function setup() {
  const props = { onUpdate: vi.fn(), onDelete: vi.fn(), onStudyNow: vi.fn() }
  // Timers falsos só para a data; o userEvent precisa avançar o tempo junto.
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<CardList cards={cards} {...props} />)
  return { user, ...props }
}

describe('CardList', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 12, 12))
  })

  afterEach(() => vi.useRealTimers())

  it('mostra mensagem quando não há cards', () => {
    render(<CardList cards={[]} onUpdate={vi.fn()} onDelete={vi.fn()} onStudyNow={vi.fn()} />)
    expect(screen.getByText(/nenhum card ainda/i)).toBeInTheDocument()
  })

  it('ordena pela próxima revisão e indica atrasos', () => {
    setup()
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(['Closure', 'React hooks'])
    expect(screen.getByText('Revisão atrasado há 2 dias')).toBeInTheDocument()
    expect(screen.getByText('Revisão em 8 dias')).toBeInTheDocument()
  })

  it('filtra por título ou descrição, sem diferenciar maiúsculas', async () => {
    const { user } = setup()
    await user.type(screen.getByRole('searchbox'), 'USESTATE')
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['React hooks'])

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'inexistente')
    expect(screen.getByText('Nenhum card encontrado.')).toBeInTheDocument()
  })

  it('só oferece "Revisar hoje" para cards que ainda não venceram', async () => {
    const { user, onStudyNow } = setup()
    const buttons = screen.getAllByRole('button', { name: 'Revisar hoje' })
    expect(buttons).toHaveLength(1)
    await user.click(buttons[0])
    expect(onStudyNow).toHaveBeenCalledWith('b')
  })

  it('pede confirmação antes de excluir', async () => {
    const { user, onDelete } = setup()
    const confirm = vi.spyOn(window, 'confirm')

    confirm.mockReturnValueOnce(false)
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[0])
    expect(onDelete).not.toHaveBeenCalled()

    confirm.mockReturnValueOnce(true)
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[0])
    expect(onDelete).toHaveBeenCalledWith('a')
  })

  it('edita um card inline', async () => {
    const { user, onUpdate } = setup()
    const item = screen.getByRole('heading', { name: 'Closure' }).closest('li')!
    await user.click(within(item).getByRole('button', { name: 'Editar' }))

    const title = screen.getByLabelText(/título/i)
    await user.clear(title)
    await user.type(title, 'Closures em JS')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onUpdate).toHaveBeenCalledWith('a', {
      title: 'Closures em JS',
      description: 'Escopo léxico',
      intervalDays: 3,
      categoryIds: [],
    })
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
  })
})
