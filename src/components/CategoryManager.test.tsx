import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CategoryManager } from './CategoryManager'
import { makeCard, makeCategory } from '../test/fixtures'

const categories = [makeCategory({ id: 'js', name: 'JavaScript' }), makeCategory({ id: 'react', name: 'React' })]
const cards = [makeCard({ id: 'a', categoryIds: ['js'] }), makeCard({ id: 'b', categoryIds: ['js', 'react'] })]

function setup(list = categories) {
  const props = { onAdd: vi.fn(), onRename: vi.fn(), onDelete: vi.fn() }
  const user = userEvent.setup()
  render(<CategoryManager categories={list} cards={cards} {...props} />)
  return { user, ...props }
}

describe('CategoryManager', () => {
  it('cria categoria com nome sem espaços extras', async () => {
    const { user, onAdd } = setup()
    await user.type(screen.getByLabelText('Nome da nova categoria'), '  Banco de dados ')
    await user.click(screen.getByRole('button', { name: 'Criar' }))
    expect(onAdd).toHaveBeenCalledWith('Banco de dados')
    expect(screen.getByLabelText('Nome da nova categoria')).toHaveValue('')
  })

  it('recusa nome vazio ou repetido (sem diferenciar maiúsculas e acentos)', async () => {
    const { user, onAdd } = setup()
    await user.click(screen.getByRole('button', { name: 'Criar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um nome.')

    await user.type(screen.getByLabelText('Nome da nova categoria'), 'javascript')
    await user.click(screen.getByRole('button', { name: 'Criar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/já existe/i)
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('mostra quantos cards usam cada categoria', () => {
    setup()
    const row = screen.getByText('JavaScript').closest('li')!
    expect(within(row).getByText('2 cards')).toBeInTheDocument()
    expect(within(screen.getByText('React').closest('li')!).getByText('1 card')).toBeInTheDocument()
  })

  it('renomeia inline', async () => {
    const { user, onRename } = setup()
    await user.click(screen.getByRole('button', { name: 'Renomear React' }))
    const input = screen.getByLabelText('Novo nome para React')
    await user.clear(input)
    await user.type(input, 'React Native')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onRename).toHaveBeenCalledWith('react', 'React Native')
  })

  it('confirma a exclusão informando os cards afetados', async () => {
    const { user, onDelete } = setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)

    await user.click(screen.getByRole('button', { name: 'Excluir JavaScript' }))
    expect(confirm).toHaveBeenLastCalledWith(expect.stringContaining('removida de 2 cards'))
    expect(onDelete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Excluir JavaScript' }))
    expect(onDelete).toHaveBeenCalledWith('js')
  })

  it('orienta quando ainda não há categorias', () => {
    setup([])
    expect(screen.getByText(/crie categorias/i)).toBeInTheDocument()
  })
})
