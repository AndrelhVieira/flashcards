import { useEffect, useRef, useState } from 'react'
import type { Flashcard } from '../types'
import { nextInterval } from '../lib/dates'
import { useI18n } from '../i18n/context'
import { IntervalPicker } from './IntervalPicker'

interface Props {
  dueCards: Flashcard[]
  onReview: (id: string, days: number) => void
  onGoToCards: () => void
  /** Informado quando há um filtro de categorias escondendo outros cards vencidos. */
  onClearFilter?: () => void
}

export function StudySession({ dueCards, onReview, onGoToCards, onClearFilter }: Props) {
  const { t } = useI18n()
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
        <h2>{onClearFilter ? t.study.doneFiltered : t.study.done}</h2>
        <p>
          {reviewedCount > 0
            ? t.study.reviewed(reviewedCount)
            : onClearFilter
              ? t.study.noneFiltered
              : t.study.none}
        </p>
        {onClearFilter ? (
          <button className="btn btn--primary" onClick={onClearFilter}>
            {t.study.reviewAll}
          </button>
        ) : (
          <button className="btn btn--primary" onClick={onGoToCards}>
            {t.study.manage}
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
        {t.study.remaining(dueCards.length)}
      </p>

      <button
        key={card.id}
        type="button"
        className={`flashcard${revealed ? ' flashcard--revealed' : ''}`}
        onClick={() => setRevealedId(revealed ? null : card.id)}
        aria-label={revealed ? t.study.showFront : t.study.showAnswer}
      >
        <div className="flashcard__inner">
          <div className="flashcard__face flashcard__front">
            <span className="flashcard__tag">{t.study.question}</span>
            <h2>{card.title}</h2>
            <span className="flashcard__hint">{t.study.hint}</span>
          </div>
          <div className="flashcard__face flashcard__back">
            <span className="flashcard__tag">{t.study.answer}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        </div>
      </button>

      {revealed && (
        <div className="study__actions" ref={actionsRef}>
          <p className="study__question">{t.study.how}</p>
          <div className="study__quick">
            <button className="btn btn--danger" onClick={() => review(1)}>
              {t.study.miss} · {t.days(1)}
            </button>
            <button className="btn btn--ghost" onClick={() => review(card.intervalDays)}>
              {t.study.hard} · {t.days(card.intervalDays)}
            </button>
            <button className="btn btn--success" onClick={() => review(suggested)}>
              {t.study.hit} · {t.days(suggested)}
            </button>
          </div>
          <details className="study__custom">
            <summary>{t.study.custom}</summary>
            <IntervalPicker value={null} suggested={suggested} onChange={review} label={t.common.reviewIn} />
          </details>
        </div>
      )}
    </section>
  )
}
