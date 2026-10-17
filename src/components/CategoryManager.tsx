import { useMemo, useState, type FormEvent } from 'react'
import { MAX_CATEGORY_NAME, type Category, type Flashcard } from '../types'
import { useI18n } from '../i18n/context'
import type { Messages } from '../i18n/pt'

interface Props {
  categories: Category[]
  cards: Flashcard[]
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

/** Valida o nome e devolve a mensagem de erro, se houver. */
function validate(t: Messages, name: string, categories: Category[], ignoreId?: string): string | null {
  if (!name) return t.categories.nameRequired
  const taken = categories.some(
    (c) => c.id !== ignoreId && c.name.localeCompare(name, 'pt-BR', { sensitivity: 'base' }) === 0,
  )
  return taken ? t.categories.nameTaken : null
}

export function CategoryManager({ categories, cards, onAdd, onRename, onDelete }: Props) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingError, setEditingError] = useState<string | null>(null)

  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const card of cards) for (const id of card.categoryIds) result[id] = (result[id] ?? 0) + 1
    return result
  }, [cards])

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    const problem = validate(t, trimmed, categories)
    setError(problem)
    if (problem) return
    onAdd(trimmed)
    setName('')
  }

  function startEditing(category: Category) {
    setEditingId(category.id)
    setEditingName(category.name)
    setEditingError(null)
  }

  function handleRename(e: FormEvent) {
    e.preventDefault()
    if (!editingId) return
    const trimmed = editingName.trim()
    const problem = validate(t, trimmed, categories, editingId)
    setEditingError(problem)
    if (problem) return
    onRename(editingId, trimmed)
    setEditingId(null)
  }

  function handleDelete(category: Category) {
    if (confirm(t.categories.confirmDelete(category.name, counts[category.id] ?? 0))) onDelete(category.id)
  }

  return (
    <details className="panel categories">
      <summary className="panel__title categories__summary">
        {t.common.categories}
        <span className="tab__count tab__count--muted">{categories.length}</span>
      </summary>

      <form className="categories__add" onSubmit={handleAdd}>
        <input
          className="search"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          placeholder={t.categories.placeholder}
          maxLength={MAX_CATEGORY_NAME}
          aria-label={t.categories.newNameLabel}
          aria-invalid={!!error}
        />
        <button type="submit" className="btn btn--primary">
          {t.categories.create}
        </button>
      </form>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="muted categories__empty">
          {t.categories.empty}
        </p>
      ) : (
        <ul className="categories__list">
          {categories.map((category) =>
            editingId === category.id ? (
              <li key={category.id} className="categories__item">
                <form className="categories__add" onSubmit={handleRename}>
                  <input
                    className="search"
                    value={editingName}
                    onChange={(e) => {
                      setEditingName(e.target.value)
                      setEditingError(null)
                    }}
                    maxLength={MAX_CATEGORY_NAME}
                    aria-label={t.categories.renameLabel(category.name)}
                    aria-invalid={!!editingError}
                    autoFocus
                  />
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => setEditingId(null)}>
                    {t.common.cancel}
                  </button>
                  <button type="submit" className="btn btn--small btn--primary">
                    {t.common.save}
                  </button>
                </form>
                {editingError && (
                  <p className="field__error" role="alert">
                    {editingError}
                  </p>
                )}
              </li>
            ) : (
              <li key={category.id} className="categories__item">
                <div className="categories__row">
                  <span className="categories__name">{category.name}</span>
                  <span className="muted categories__count">
                    {t.categories.count(counts[category.id] ?? 0)}
                  </span>
                  <button
                    className="btn btn--small btn--ghost"
                    onClick={() => startEditing(category)}
                    aria-label={t.categories.renameAria(category.name)}
                  >
                    {t.categories.rename}
                  </button>
                  <button
                    className="btn btn--small btn--ghost btn--danger-text"
                    onClick={() => handleDelete(category)}
                    aria-label={t.categories.deleteAria(category.name)}
                  >
                    {t.common.delete}
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </details>
  )
}
