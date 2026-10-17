import { useState, type FormEvent } from 'react'
import type { Category, FlashcardInput } from '../types'
import { CategoryPicker } from './CategoryPicker'
import { IntervalPicker } from './IntervalPicker'
import { useI18n } from '../i18n/context'

interface Props {
  initial?: FlashcardInput
  categories: Category[]
  submitLabel: string
  onSubmit: (input: FlashcardInput) => void
  onCancel?: () => void
}

const EMPTY: FlashcardInput = { title: '', description: '', intervalDays: 1, categoryIds: [] }

export function CardForm({ initial = EMPTY, categories, submitLabel, onSubmit, onCancel }: Props) {
  const { t } = useI18n()
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [intervalDays, setIntervalDays] = useState(initial.intervalDays)
  const [categoryIds, setCategoryIds] = useState(initial.categoryIds)

  const canSubmit = title.trim() !== '' && description.trim() !== ''

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      intervalDays,
      // Descarta categorias excluídas enquanto o formulário estava aberto.
      categoryIds: categoryIds.filter((id) => categories.some((c) => c.id === id)),
    })
    if (!onCancel) {
      // Formulário de criação: limpa para o próximo card.
      setTitle('')
      setDescription('')
    }
  }

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">{t.form.title}</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.form.titlePlaceholder}
          maxLength={200}
          required
          autoFocus={!!onCancel}
        />
      </label>

      <label className="field">
        <span className="field__label">{t.form.description}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.form.descriptionPlaceholder}
          rows={4}
          maxLength={10_000}
          required
        />
      </label>

      <div className="field">
        <span className="field__label">{t.common.reviewIn}</span>
        <IntervalPicker value={intervalDays} onChange={setIntervalDays} label={t.common.reviewIn} />
      </div>

      {categories.length > 0 && (
        <div className="field">
          <span className="field__label">{t.common.categories}</span>
          <CategoryPicker
            categories={categories}
            selected={categoryIds}
            onChange={setCategoryIds}
            label={t.common.categories}
          />
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {t.common.cancel}
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
