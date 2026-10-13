import { useEffect, useRef, useState } from 'react'
import type { Flashcard } from '../types'
import { formatDays, nextInterval } from '../lib/dates'
import { IntervalPicker } from './IntervalPicker'

interface Props {
  dueCards: Flashcard[]
  onReview: (id: string, days: number) => void
  onGoToCards: () => void
  /** Informado quando há um filtro de categorias escondendo outros cards vencidos. */
  onClearFilter?: () => void
}

export function StudySession({ dueCards, onReview, onGoToCards, onClearFilter }: Props) {
  // Guarda o id do card virado: se o card atual mudar (ex.: troca de filtro), volta para a frente.
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const [reviewedCount, setReviewedCount] = useState(0)
  const actionsRef = useRef<HTMLDivElement>(null)
  const card = dueCards[0]
  const revealed = !!card && revealedId === card.id

  // No celular os botões de avaliação ficam abaixo da dobra.
  useEffect(() => {
    if (revealed) actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [revealed])

  // Atalho: espaço/enter vira o card.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!card || revealed) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, button')) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setRevealedId(card.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, revealed])

  if (!card) {
    return (
      <section className="empty">
        <div className="empty__icon" aria-hidden>🎉</div>
        <h2>{onClearFilter ? 'Categorias em dia!' : 'Tudo em dia!'}</h2>
        <p>
          {reviewedCount > 0
            ? `Você revisou ${reviewedCount} ${reviewedCount === 1 ? 'card' : 'cards'} nesta sessão.`
            : onClearFilter
              ? 'Nenhum card dessas categorias para revisar hoje.'
              : 'Nenhum card para revisar hoje.'}
        </p>
        {onClearFilter ? (
          <button className="btn btn--primary" onClick={onClearFilter}>
            Revisar todas as categorias
          </button>
        ) : (
          <button className="btn btn--primary" onClick={onGoToCards}>
            Gerenciar cards
          </button>
        )}
      </section>
    )
  }

  function review(days: number) {
    onReview(card.id, days)
    setRevealedId(null)
    setReviewedCount((n) => n + 1)
  }

  const suggested = nextInterval(card.intervalDays)

  return (
    <section className="study">
      <p className="study__progress">
        {dueCards.length} {dueCards.length === 1 ? 'card restante' : 'cards restantes'}
      </p>

      <button
        key={card.id}
        type="button"
        className={`flashcard${revealed ? ' flashcard--revealed' : ''}`}
        onClick={() => setRevealedId(revealed ? null : card.id)}
        aria-label={revealed ? 'Mostrar frente' : 'Mostrar resposta'}
      >
        <div className="flashcard__inner">
          <div className="flashcard__face flashcard__front">
            <span className="flashcard__tag">Pergunta</span>
            <h2>{card.title}</h2>
            <span className="flashcard__hint">Clique ou pressione espaço para ver a resposta</span>
          </div>
          <div className="flashcard__face flashcard__back">
            <span className="flashcard__tag">Resposta</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        </div>
      </button>

      {revealed && (
        <div className="study__actions" ref={actionsRef}>
          <p className="study__question">Como foi? Escolha quando revisar novamente:</p>
          <div className="study__quick">
            <button className="btn btn--danger" onClick={() => review(1)}>
              Errei · {formatDays(1)}
            </button>
            <button className="btn btn--ghost" onClick={() => review(card.intervalDays)}>
              Difícil · {formatDays(card.intervalDays)}
            </button>
            <button className="btn btn--success" onClick={() => review(suggested)}>
              Acertei · {formatDays(suggested)}
            </button>
          </div>
          <details className="study__custom">
            <summary>Escolher outro intervalo</summary>
            <IntervalPicker value={null} suggested={suggested} onChange={review} label="Revisar em" />
          </details>
        </div>
      )}
    </section>
  )
}
