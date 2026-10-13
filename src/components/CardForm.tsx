import { useState, type FormEvent } from 'react'
import type { FlashcardInput } from '../types'
import { IntervalPicker } from './IntervalPicker'

interface Props {
  initial?: FlashcardInput
  submitLabel: string
  onSubmit: (input: FlashcardInput) => void
  onCancel?: () => void
}

const EMPTY: FlashcardInput = { title: '', description: '', intervalDays: 1, categoryIds: [] }

export function CardForm({ initial = EMPTY, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [intervalDays, setIntervalDays] = useState(initial.intervalDays)

  const canSubmit = title.trim() !== '' && description.trim() !== ''

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ title: title.trim(), description: description.trim(), intervalDays, categoryIds: initial.categoryIds })
    if (!onCancel) {
      // Formulário de criação: limpa para o próximo card.
      setTitle('')
      setDescription('')
    }
  }

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Título (frente)</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: O que é closure em JavaScript?"
          maxLength={200}
          required
          autoFocus={!!onCancel}
        />
      </label>

      <label className="field">
        <span className="field__label">Descrição (verso)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A resposta ou explicação que você quer memorizar…"
          rows={4}
          maxLength={10_000}
          required
        />
      </label>

      <div className="field">
        <span className="field__label">Revisar em</span>
        <IntervalPicker value={intervalDays} onChange={setIntervalDays} label="Revisar em" />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
