import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { StudySession } from './StudySession'
import { makeCard } from '../test/fixtures'

beforeAll(() => {
  // jsdom não implementa scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn()
})

function setup(cards = [makeCard({ intervalDays: 3 })]) {
  const onReview = vi.fn()
  const onGoToCards = vi.fn()
  const user = userEvent.setup()
  const utils = render(<StudySession dueCards={cards} onReview={onReview} onGoToCards={onGoToCards} />)
  return { user, onReview, onGoToCards, ...utils }
}

describe('StudySession', () => {
  it('mostra estado vazio quando não há cards vencidos', async () => {
    const { user, onGoToCards } = setup([])
    expect(screen.getByText('Tudo em dia!')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Gerenciar cards' }))
    expect(onGoToCards).toHaveBeenCalled()
  })

  it('só mostra as opções de avaliação depois de virar o card', async () => {
    const { user } = setup()
    expect(screen.queryByRole('button', { name: /acertei/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mostrar resposta' }))
    expect(screen.getByRole('button', { name: /acertei/i })).toBeInTheDocument()
  })

  it('vira o card com a tecla espaço', async () => {
    const { user } = setup()
    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: 'Mostrar frente' })).toBeInTheDocument()
  })

  it.each([
    [/errei/i, 1],
    [/difícil/i, 3],
    [/acertei/i, 5],
  ])('botão %s agenda a revisão para %i dia(s)', async (name, days) => {
    const { user, onReview } = setup()
    await user.click(screen.getByRole('button', { name: 'Mostrar resposta' }))
    await user.click(screen.getByRole('button', { name }))
    expect(onReview).toHaveBeenCalledWith('card-1', days)
  })

  it('permite escolher um intervalo personalizado', async () => {
    const { user, onReview } = setup()
    await user.click(screen.getByRole('button', { name: 'Mostrar resposta' }))
    await user.click(screen.getByText('Escolher outro intervalo'))
    await user.click(screen.getByRole('radio', { name: '30 dias' }))
    expect(onReview).toHaveBeenCalledWith('card-1', 30)
  })

  it('volta para a frente ao passar para o próximo card e conta as revisões', async () => {
    const first = makeCard({ id: 'a', title: 'Primeiro' })
    const second = makeCard({ id: 'b', title: 'Segundo' })
    const { user, rerender, onReview, onGoToCards } = setup([first, second])

    await user.click(screen.getByRole('button', { name: 'Mostrar resposta' }))
    await user.click(screen.getByRole('button', { name: /acertei/i }))
    rerender(<StudySession dueCards={[second]} onReview={onReview} onGoToCards={onGoToCards} />)

    expect(screen.getByRole('button', { name: 'Mostrar resposta' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Segundo', level: 2 })).toBeInTheDocument()

    rerender(<StudySession dueCards={[]} onReview={onReview} onGoToCards={onGoToCards} />)
    expect(screen.getByText(/revisou 1 card nesta sessão/i)).toBeInTheDocument()
  })

  it('volta para a frente se o card atual mudar sem avaliação (troca de filtro)', async () => {
    const first = makeCard({ id: 'a', title: 'Primeiro' })
    const second = makeCard({ id: 'b', title: 'Segundo' })
    const { user, rerender, onReview, onGoToCards } = setup([first, second])

    await user.click(screen.getByRole('button', { name: 'Mostrar resposta' }))
    rerender(<StudySession dueCards={[second]} onReview={onReview} onGoToCards={onGoToCards} />)
    expect(screen.getByRole('button', { name: 'Mostrar resposta' })).toBeInTheDocument()
  })

  it('com filtro ativo, oferece revisar todas as categorias', async () => {
    const onClearFilter = vi.fn()
    const user = userEvent.setup()
    render(<StudySession dueCards={[]} onReview={vi.fn()} onGoToCards={vi.fn()} onClearFilter={onClearFilter} />)

    expect(screen.getByText(/nenhum card dessas categorias/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Revisar todas as categorias' }))
    expect(onClearFilter).toHaveBeenCalled()
  })
})
