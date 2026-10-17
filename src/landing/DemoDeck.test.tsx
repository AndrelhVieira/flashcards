import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DemoDeck } from './DemoDeck'

describe('DemoDeck', () => {
  it('só libera as respostas depois de virar o card', async () => {
    const user = userEvent.setup()
    render(<DemoDeck />)

    expect(screen.getByRole('button', { name: 'Acertei' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /pergunta: o que é revisão espaçada/i }))
    expect(screen.getByRole('button', { name: 'Acertei' })).toBeEnabled()
  })

  it('agenda como o app e passa para o próximo card', async () => {
    const user = userEvent.setup()
    render(<DemoDeck />)

    // Primeiro card está em 3 dias: acertar sobe para 5.
    await user.click(screen.getByRole('button', { name: /pergunta: o que é revisão espaçada/i }))
    await user.click(screen.getByRole('button', { name: 'Acertei' }))
    expect(screen.getByRole('status')).toHaveTextContent('Volta em 5 dias.')

    // Segundo card: errar volta para amanhã.
    await user.click(screen.getByRole('button', { name: /pergunta: quanto custa/i }))
    await user.click(screen.getByRole('button', { name: 'Errei' }))
    expect(screen.getByRole('status')).toHaveTextContent('Volta amanhã.')
  })
})
