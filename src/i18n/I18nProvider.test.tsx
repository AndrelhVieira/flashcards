import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { StudySession } from '../components/StudySession'
import { I18nProvider } from './I18nProvider'
import { LANG_STORAGE_KEY } from './context'
import { LanguageSwitch } from './LanguageSwitch'

function renderApp() {
  return render(
    <I18nProvider>
      <LanguageSwitch />
      <StudySession dueCards={[]} onReview={() => {}} onGoToCards={() => {}} />
    </I18nProvider>,
  )
}

describe('I18nProvider', () => {
  afterEach(() => localStorage.clear())

  it('usa português por padrão', () => {
    renderApp()
    expect(screen.getByRole('heading', { name: 'Tudo em dia!' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pt-BR')
  })

  it('troca para inglês, lembra a escolha e volta para português', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('heading', { name: 'All caught up!' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en')

    await user.click(screen.getByRole('button', { name: 'Português' }))
    expect(screen.getByRole('heading', { name: 'Tudo em dia!' })).toBeInTheDocument()
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBeNull()
  })

  it('abre em inglês quando essa foi a escolha anterior', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'en')
    renderApp()
    expect(screen.getByRole('button', { name: 'Manage cards' })).toBeInTheDocument()
  })
})
