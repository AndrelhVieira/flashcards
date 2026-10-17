import { useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { useCards } from '../hooks/useCards'
import { useCategories } from '../hooks/useCategories'
import { useOnline } from '../hooks/useOnline'
import { useToday } from '../hooks/useToday'
import { useI18n } from '../i18n/context'
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
  const { t } = useI18n()
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
      if (confirm(t.dashboard.importConfirm(backup.cards.length, backup.categories.length))) {
        importCategories(backup.categories)
        importCards(backup.cards)
      }
    } catch {
      alert(t.dashboard.invalidBackup)
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
          {!online && <span className="badge badge--offline">{t.dashboard.offline}</span>}
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
          <p>{t.dashboard.legacy(legacyCards.length)}</p>
          <div className="banner__actions">
            <button className="btn btn--small btn--ghost" onClick={() => migrateLegacy(false)}>
              {t.dashboard.discard}
            </button>
            <button className="btn btn--small btn--primary" onClick={() => migrateLegacy(true)}>
              {t.dashboard.import}
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
            {t.dashboard.close}
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
          {t.dashboard.tabStudy}
          {dueCards.length > 0 && <span className="tab__count">{dueCards.length}</span>}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'cards'}
          className={`tab${tab === 'cards' ? ' tab--active' : ''}`}
          onClick={() => setTab('cards')}
        >
          {t.dashboard.tabCards}
          <span className="tab__count tab__count--muted">{cards.length}</span>
        </button>
      </nav>

      <main>
        {error ? (
          <p className="login__error center" role="alert">
            {error}
          </p>
        ) : loading ? (
          <div className="spinner" aria-label={t.common.loading} />
        ) : tab === 'study' ? (
          <>
            {categories.length > 0 && (
              <div className="study-filter">
                <CategoryPicker
                  categories={categories}
                  selected={activeStudyFilter}
                  onChange={changeStudyFilter}
                  label={t.dashboard.studyFilter}
                  allLabel={t.common.all}
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
              <h2 className="panel__title">{t.dashboard.newCard}</h2>
              <CardForm categories={categories} submitLabel={t.dashboard.addCard} onSubmit={addCard} />
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
