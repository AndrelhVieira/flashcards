import { useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { useCards } from '../hooks/useCards'
import { useOnline } from '../hooks/useOnline'
import { isDue, today } from '../lib/dates'
import { clearLegacyCards, exportCards, loadLegacyCards, readCardsFile } from '../lib/storage'
import { CardForm } from './CardForm'
import { CardList } from './CardList'
import { StudySession } from './StudySession'
import { UserMenu } from './UserMenu'

type Tab = 'study' | 'cards'

interface Props {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: Props) {
  const { cards, loading, error, addCard, updateCard, deleteCard, reviewCard, studyNow, importCards } =
    useCards(user.uid)
  const online = useOnline()
  const [tab, setTab] = useState<Tab>('study')
  const [legacyCards, setLegacyCards] = useState(loadLegacyCards)

  const dueCards = useMemo(() => {
    const ref = today()
    return cards
      .filter((c) => isDue(c.nextReview, ref))
      .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
  }, [cards])

  async function handleImportFile(file: File) {
    try {
      const imported = await readCardsFile(file)
      if (confirm(`Importar ${imported.length} cards para sua conta? Cards com o mesmo id serão atualizados.`)) {
        importCards(imported)
      }
    } catch {
      alert('Arquivo inválido. Use um backup exportado por este app.')
    }
  }

  function migrateLegacy(accept: boolean) {
    if (accept) importCards(legacyCards)
    clearLegacyCards()
    setLegacyCards([])
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img src="/icon.svg" alt="" width={30} height={30} />
          <span>Flashcards</span>
          {!online && <span className="badge badge--offline">Offline</span>}
        </div>
        <UserMenu
          user={user}
          canExport={cards.length > 0}
          onExport={() => exportCards(cards)}
          onImportFile={handleImportFile}
          onLogout={onLogout}
        />
      </header>

      {legacyCards.length > 0 && (
        <div className="banner" role="status">
          <p>
            Encontramos {legacyCards.length} {legacyCards.length === 1 ? 'card salvo' : 'cards salvos'} neste
            navegador. Deseja enviá-los para sua conta?
          </p>
          <div className="banner__actions">
            <button className="btn btn--small btn--ghost" onClick={() => migrateLegacy(false)}>
              Descartar
            </button>
            <button className="btn btn--small btn--primary" onClick={() => migrateLegacy(true)}>
              Importar
            </button>
          </div>
        </div>
      )}

      <nav className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'study'}
          className={`tab${tab === 'study' ? ' tab--active' : ''}`}
          onClick={() => setTab('study')}
        >
          Estudar
          {dueCards.length > 0 && <span className="tab__count">{dueCards.length}</span>}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'cards'}
          className={`tab${tab === 'cards' ? ' tab--active' : ''}`}
          onClick={() => setTab('cards')}
        >
          Meus cards
          <span className="tab__count tab__count--muted">{cards.length}</span>
        </button>
      </nav>

      <main>
        {error ? (
          <p className="login__error center" role="alert">
            {error}
          </p>
        ) : loading ? (
          <div className="spinner" aria-label="Carregando" />
        ) : tab === 'study' ? (
          <StudySession dueCards={dueCards} onReview={reviewCard} onGoToCards={() => setTab('cards')} />
        ) : (
          <>
            <section className="panel">
              <h2 className="panel__title">Novo flashcard</h2>
              <CardForm submitLabel="Adicionar card" onSubmit={addCard} />
            </section>
            <CardList cards={cards} onUpdate={updateCard} onDelete={deleteCard} onStudyNow={studyNow} />
          </>
        )}
      </main>
    </div>
  )
}
