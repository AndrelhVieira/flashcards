import { useMemo, useState } from 'react'
import type { Category, Flashcard, FlashcardInput } from '../types'
import { describeReview, formatDays, isDue } from '../lib/dates'
import { CardForm } from './CardForm'
import { CategoryPicker } from './CategoryPicker'

interface Props {
  cards: Flashcard[]
  categories: Category[]
  onUpdate: (id: string, input: FlashcardInput) => void
  onDelete: (id: string) => void
  onStudyNow: (id: string) => void
}

export function CardList({ cards, categories, onUpdate, onDelete, onStudyNow }: Props) {
  const [query, setQuery] = useState('')
  const [filterIds, setFilterIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  // Ignora filtros de categorias que foram excluídas.
  const activeFilter = useMemo(() => filterIds.filter((id) => categoryNames.has(id)), [filterIds, categoryNames])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = cards.filter(
      (c) =>
        (!q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) &&
        (activeFilter.length === 0 || c.categoryIds.some((id) => activeFilter.includes(id))),
    )
    return list.sort((a, b) => a.nextReview.localeCompare(b.nextReview))
  }, [cards, query, activeFilter])

  if (cards.length === 0) {
    return <p className="muted center">Nenhum card ainda. Crie o primeiro acima!</p>
  }

  return (
    <section className="card-list">
      <input
        type="search"
        className="search"
        placeholder={`Buscar em ${cards.length} cards…`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar cards"
      />

      {categories.length > 0 && (
        <CategoryPicker
          categories={categories}
          selected={activeFilter}
          onChange={setFilterIds}
          label="Filtrar por categoria"
          allLabel="Todas"
        />
      )}

      {filtered.length === 0 && <p className="muted center">Nenhum card encontrado.</p>}

      <ul>
        {filtered.map((card) =>
          editingId === card.id ? (
            <li key={card.id} className="card-item card-item--editing">
              <CardForm
                initial={card}
                categories={categories}
                submitLabel="Salvar"
                onSubmit={(input) => {
                  onUpdate(card.id, input)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li key={card.id} className="card-item">
              <div className="card-item__body">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {card.categoryIds.some((id) => categoryNames.has(id)) && (
                  <div className="tag-list" aria-label="Categorias">
                    {card.categoryIds
                      .filter((id) => categoryNames.has(id))
                      .map((id) => (
                        <span key={id} className="tag">
                          {categoryNames.get(id)}
                        </span>
                      ))}
                  </div>
                )}
                <div className="card-item__meta">
                  <span className={`badge${isDue(card.nextReview) ? ' badge--due' : ''}`}>
                    Revisão {describeReview(card.nextReview)}
                  </span>
                  <span className="muted">
                    Intervalo: {formatDays(card.intervalDays)} · {card.reviewCount}{' '}
                    {card.reviewCount === 1 ? 'revisão' : 'revisões'}
                  </span>
                </div>
              </div>
              <div className="card-item__actions">
                {!isDue(card.nextReview) && (
                  <button className="btn btn--small btn--ghost" onClick={() => onStudyNow(card.id)}>
                    Revisar hoje
                  </button>
                )}
                <button className="btn btn--small btn--ghost" onClick={() => setEditingId(card.id)}>
                  Editar
                </button>
                <button
                  className="btn btn--small btn--ghost btn--danger-text"
                  onClick={() => {
                    if (confirm(`Excluir o card "${card.title}"?`)) onDelete(card.id)
                  }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}
