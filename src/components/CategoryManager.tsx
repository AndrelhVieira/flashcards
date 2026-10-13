import { useMemo, useState, type FormEvent } from 'react'
import { MAX_CATEGORY_NAME, type Category, type Flashcard } from '../types'

interface Props {
  categories: Category[]
  cards: Flashcard[]
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

/** Valida o nome e devolve a mensagem de erro, se houver. */
function validate(name: string, categories: Category[], ignoreId?: string): string | null {
  if (!name) return 'Informe um nome.'
  const taken = categories.some(
    (c) => c.id !== ignoreId && c.name.localeCompare(name, 'pt-BR', { sensitivity: 'base' }) === 0,
  )
  return taken ? 'Já existe uma categoria com esse nome.' : null
}

export function CategoryManager({ categories, cards, onAdd, onRename, onDelete }: Props) {
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
    const problem = validate(trimmed, categories)
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
    const problem = validate(trimmed, categories, editingId)
    setEditingError(problem)
    if (problem) return
    onRename(editingId, trimmed)
    setEditingId(null)
  }

  function handleDelete(category: Category) {
    const used = counts[category.id] ?? 0
    const detail = used > 0 ? ` Ela será removida de ${used} ${used === 1 ? 'card' : 'cards'}, que não serão excluídos.` : ''
    if (confirm(`Excluir a categoria "${category.name}"?${detail}`)) onDelete(category.id)
  }

  return (
    <details className="panel categories">
      <summary className="panel__title categories__summary">
        Categorias
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
          placeholder="Nova categoria, ex.: JavaScript"
          maxLength={MAX_CATEGORY_NAME}
          aria-label="Nome da nova categoria"
          aria-invalid={!!error}
        />
        <button type="submit" className="btn btn--primary">
          Criar
        </button>
      </form>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="muted categories__empty">
          Crie categorias para agrupar seus cards e revisar por assunto.
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
                    aria-label={`Novo nome para ${category.name}`}
                    aria-invalid={!!editingError}
                    autoFocus
                  />
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => setEditingId(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn--small btn--primary">
                    Salvar
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
                    {counts[category.id] ?? 0} {(counts[category.id] ?? 0) === 1 ? 'card' : 'cards'}
                  </span>
                  <button
                    className="btn btn--small btn--ghost"
                    onClick={() => startEditing(category)}
                    aria-label={`Renomear ${category.name}`}
                  >
                    Renomear
                  </button>
                  <button
                    className="btn btn--small btn--ghost btn--danger-text"
                    onClick={() => handleDelete(category)}
                    aria-label={`Excluir ${category.name}`}
                  >
                    Excluir
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
