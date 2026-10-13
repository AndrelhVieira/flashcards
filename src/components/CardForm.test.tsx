import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CardForm } from './CardForm'

describe('CardForm', () => {
  it('só habilita o envio com título e descrição preenchidos', async () => {
    const user = userEvent.setup()
    render(<CardForm submitLabel="Adicionar" onSubmit={vi.fn()} />)
    const submit = screen.getByRole('button', { name: 'Adicionar' })

    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText(/título/i), 'Pergunta')
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText(/descrição/i), '   ')
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText(/descrição/i), 'Resposta')
    expect(submit).toBeEnabled()
  })

  it('envia os dados sem espaços extras e com o intervalo escolhido, depois limpa', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CardForm submitLabel="Adicionar" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/título/i), '  Pergunta  ')
    await user.type(screen.getByLabelText(/descrição/i), ' Resposta ')
    await user.click(screen.getByRole('radio', { name: '7 dias' }))
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Pergunta', description: 'Resposta', intervalDays: 7, categoryIds: [] })
    expect(screen.getByLabelText(/título/i)).toHaveValue('')
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('')
  })

  it('no modo edição, preenche os valores e permite cancelar', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onSubmit = vi.fn()
    render(
      <CardForm
        initial={{ title: 'T', description: 'D', intervalDays: 15, categoryIds: [] }}
        submitLabel="Salvar"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByLabelText(/título/i)).toHaveValue('T')
    expect(screen.getByRole('radio', { name: '15 dias' })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
