import { useMemo, useState } from 'react'
import type { Flashcard, FlashcardInput } from '../types'
import { describeReview, formatDays, isDue } from '../lib/dates'
import { CardForm } from './CardForm'

interface Props {
  cards: Flashcard[]
  onUpdate: (id: string, input: FlashcardInput) => void
  onDelete: (id: string) => void
  onStudyNow: (id: string) => void
}

export function CardList({ cards, onUpdate, onDelete, onStudyNow }: Props) {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? cards.filter(
          (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
        )
      : cards
    return [...list].sort((a, b) => a.nextReview.localeCompare(b.nextReview))
  }, [cards, query])

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

      {filtered.length === 0 && <p className="muted center">Nenhum card encontrado.</p>}

      <ul>
        {filtered.map((card) =>
          editingId === card.id ? (
            <li key={card.id} className="card-item card-item--editing">
              <CardForm
                initial={card}
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
