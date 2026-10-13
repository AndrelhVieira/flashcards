import { useState } from 'react'
import { formatDays, nextInterval } from '../lib/dates'

interface DemoCard {
  front: string
  back: string
  /** Intervalo atual do card, em dias. */
  interval: number
}

const DECK: DemoCard[] = [
  {
    front: 'O que é revisão espaçada?',
    back: 'Rever um conteúdo em intervalos cada vez maiores, pouco antes de você esquecê-lo.',
    interval: 3,
  },
  {
    front: 'Quanto custa este app?',
    back: 'Nada. Sem anúncios, sem assinatura e sem recurso escondido atrás de um plano pago.',
    interval: 7,
  },
  {
    front: 'Funciona sem internet?',
    back: 'Sim. Estude offline e tudo sincroniza sozinho quando a conexão voltar.',
    interval: 1,
  },
  {
    front: 'Meus cards ficam presos aqui?',
    back: 'Não. Exporte tudo em JSON quando quiser e importe de volta em outra conta.',
    interval: 15,
  },
]

type Answer = 'errei' | 'dificil' | 'acertei'

/** Mesma regra do app: errei → amanhã, difícil → mantém, acertei → próximo degrau. */
function scheduleFor(answer: Answer, interval: number) {
  if (answer === 'errei') return 1
  if (answer === 'dificil') return interval
  return nextInterval(interval)
}

export function DemoDeck() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const card = DECK[index]

  function answer(a: Answer) {
    const days = scheduleFor(a, card.interval)
    setFeedback(days === 1 ? 'Volta amanhã.' : `Volta em ${formatDays(days)}.`)
    setFlipped(false)
    setIndex((i) => (i + 1) % DECK.length)
  }

  return (
    <div className="demo" aria-label="Demonstração interativa">
      <div className="demo__stack">
        <span className="demo__shadow demo__shadow--2" aria-hidden />
        <span className="demo__shadow demo__shadow--1" aria-hidden />
        <button
          key={index}
          type="button"
          className={`demo__card${flipped ? ' demo__card--flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={flipped ? `Resposta: ${card.back}` : `Pergunta: ${card.front}. Toque para ver a resposta.`}
        >
          <span className="demo__face demo__face--front">
            <span className="demo__tag">Frente · revisa a cada {formatDays(card.interval)}</span>
            <span className="demo__text">{card.front}</span>
            <span className="demo__hint">toque para virar</span>
          </span>
          <span className="demo__face demo__face--back">
            <span className="demo__tag">Verso</span>
            <span className="demo__text demo__text--back">{card.back}</span>
          </span>
        </button>
      </div>

      <div className="demo__actions" data-visible={flipped}>
        <button type="button" className="chip chip--miss" onClick={() => answer('errei')} disabled={!flipped}>
          Errei
        </button>
        <button type="button" className="chip" onClick={() => answer('dificil')} disabled={!flipped}>
          Difícil
        </button>
        <button type="button" className="chip chip--hit" onClick={() => answer('acertei')} disabled={!flipped}>
          Acertei
        </button>
      </div>
      <p className="demo__feedback" role="status">
        {feedback ?? 'Experimente: vire o card e responda.'}
      </p>
    </div>
  )
}
