import { useState } from 'react'
import { useI18n } from '../i18n/context'
import { nextInterval } from '../lib/dates'

/** Intervalo atual (em dias) de cada card da demonstração; os textos vêm do i18n, na mesma ordem. */
const DECK_INTERVALS = [3, 7, 1, 15]

type Answer = 'errei' | 'dificil' | 'acertei'

/** Mesma regra do app: errei → amanhã, difícil → mantém, acertei → próximo degrau. */
function scheduleFor(answer: Answer, interval: number) {
  if (answer === 'errei') return 1
  if (answer === 'dificil') return interval
  return nextInterval(interval)
}

export function DemoDeck() {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  /** Dias até o card respondido voltar; o texto é montado no idioma atual. */
  const [feedbackDays, setFeedbackDays] = useState<number | null>(null)

  const card = { ...t.demo.cards[index], interval: DECK_INTERVALS[index] }

  function answer(a: Answer) {
    setFeedbackDays(scheduleFor(a, card.interval))
    setFlipped(false)
    setIndex((i) => (i + 1) % DECK_INTERVALS.length)
  }

  return (
    <div className="demo" aria-label={t.demo.label}>
      <div className="demo__stack">
        <span className="demo__shadow demo__shadow--2" aria-hidden />
        <span className="demo__shadow demo__shadow--1" aria-hidden />
        <button
          key={index}
          type="button"
          className={`demo__card${flipped ? ' demo__card--flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={flipped ? t.demo.answerAria(card.back) : t.demo.questionAria(card.front)}
        >
          <span className="demo__face demo__face--front">
            <span className="demo__tag">{t.demo.frontTag(card.interval)}</span>
            <span className="demo__text">{card.front}</span>
            <span className="demo__hint">{t.demo.hint}</span>
          </span>
          <span className="demo__face demo__face--back">
            <span className="demo__tag">{t.demo.backTag}</span>
            <span className="demo__text demo__text--back">{card.back}</span>
          </span>
        </button>
      </div>

      <div className="demo__actions" data-visible={flipped}>
        <button type="button" className="chip chip--miss" onClick={() => answer('errei')} disabled={!flipped}>
          {t.study.miss}
        </button>
        <button type="button" className="chip" onClick={() => answer('dificil')} disabled={!flipped}>
          {t.study.hard}
        </button>
        <button type="button" className="chip chip--hit" onClick={() => answer('acertei')} disabled={!flipped}>
          {t.study.hit}
        </button>
      </div>
      <p className="demo__feedback" role="status">
        {feedbackDays === null ? t.demo.idle : t.demo.feedback(feedbackDays)}
      </p>
    </div>
  )
}
