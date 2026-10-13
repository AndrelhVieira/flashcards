import { useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { useCards } from '../hooks/useCards'
import { useCategories } from '../hooks/useCategories'
import { useOnline } from '../hooks/useOnline'
import { useToday } from '../hooks/useToday'
import { isDue } from '../lib/dates'
import {
  clearLegacyCards,
  exportBackup,
  loadLegacyCards,
  loadStudyFilter,
  readBackupFile,
  saveStudyFilter,
} from '../lib/storage'
import { CardForm } from './CardForm'
import { CardList } from './CardList'
import { CategoryManager } from './CategoryManager'
import { CategoryPicker } from './CategoryPicker'
import { StudySession } from './StudySession'
import { UserMenu } from './UserMenu'

type Tab = 'study' | 'cards'

interface Props {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: Props) {
  const {
    cards,
    loading,
    error,
    syncError,
    dismissSyncError,
    addCard,
    updateCard,
    deleteCard,
    reviewCard,
    studyNow,
    importCards,
  } = useCards(user.uid)
  const {
    categories,
    syncError: categorySyncError,
    dismissSyncError: dismissCategorySyncError,
    addCategory,
    renameCategory,
    deleteCategory,
    importCategories,
  } = useCategories(user.uid)
  const online = useOnline()
  const currentDay = useToday()
  const [tab, setTab] = useState<Tab>('study')
  const [legacyCards, setLegacyCards] = useState(loadLegacyCards)
  const [studyFilter, setStudyFilter] = useState(() => loadStudyFilter(user.uid))

  const dueCards = useMemo(
    () =>
      cards
        .filter((c) => isDue(c.nextReview, currentDay))
        .sort((a, b) => a.nextReview.localeCompare(b.nextReview)),
    [cards, currentDay],
  )

  // Ignora categorias que foram excluídas (inclusive em outro aparelho).
  const activeStudyFilter = useMemo(
    () => studyFilter.filter((id) => categories.some((c) => c.id === id)),
    [studyFilter, categories],
  )

  const studyCards = useMemo(
    () =>
      activeStudyFilter.length === 0
        ? dueCards
        : dueCards.filter((c) => c.categoryIds.some((id) => activeStudyFilter.includes(id))),
    [dueCards, activeStudyFilter],
  )

  const dueByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const card of dueCards) for (const id of card.categoryIds) counts[id] = (counts[id] ?? 0) + 1
    return counts
  }, [dueCards])

  function changeStudyFilter(ids: string[]) {
    setStudyFilter(ids)
    saveStudyFilter(user.uid, ids)
  }

  async function handleImportFile(file: File) {
    try {
      const backup = await readBackupFile(file)
      const withCategories = backup.categories.length > 0 ? ` e ${backup.categories.length} categorias` : ''
      if (
        confirm(
          `Importar ${backup.cards.length} cards${withCategories} para sua conta? Itens com o mesmo id serão atualizados.`,
        )
      ) {
        importCategories(backup.categories)
        importCards(backup.cards)
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
          onExport={() => exportBackup(cards, categories)}
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

      {(syncError || categorySyncError) && (
        <div className="banner banner--error" role="alert">
          <p>{syncError ?? categorySyncError}</p>
          <button
            className="btn btn--small btn--ghost"
            onClick={() => {
              dismissSyncError()
              dismissCategorySyncError()
            }}
          >
            Fechar
          </button>
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
          <>
            {categories.length > 0 && (
              <div className="study-filter">
                <CategoryPicker
                  categories={categories}
                  selected={activeStudyFilter}
                  onChange={changeStudyFilter}
                  label="Revisar categorias"
                  allLabel="Todas"
                  counts={dueByCategory}
                  allCount={dueCards.length}
                />
              </div>
            )}
            <StudySession
              dueCards={studyCards}
              onReview={reviewCard}
              onGoToCards={() => setTab('cards')}
              onClearFilter={studyCards.length < dueCards.length ? () => changeStudyFilter([]) : undefined}
            />
          </>
        ) : (
          <>
            <section className="panel">
              <h2 className="panel__title">Novo flashcard</h2>
              <CardForm categories={categories} submitLabel="Adicionar card" onSubmit={addCard} />
            </section>
            <CategoryManager
              categories={categories}
              cards={cards}
              onAdd={addCategory}
              onRename={renameCategory}
              onDelete={(id) => deleteCategory(id, cards)}
            />
            <CardList
              cards={cards}
              categories={categories}
              onUpdate={updateCard}
              onDelete={deleteCard}
              onStudyNow={studyNow}
            />
          </>
        )}
      </main>
    </div>
  )
}
