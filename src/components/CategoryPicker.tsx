import type { Category } from '../types'

interface Props {
  categories: Category[]
  selected: string[]
  onChange: (ids: string[]) => void
  label: string
  /** Quando informado, mostra um chip que limpa a seleção (seleção vazia = todas). */
  allLabel?: string
  /** Número exibido ao lado de cada categoria. */
  counts?: Record<string, number>
  /** Número exibido ao lado do chip de "todas". */
  allCount?: number
}

/** Seleção múltipla de categorias em chips. */
export function CategoryPicker({ categories, selected, onChange, label, allLabel, counts, allCount }: Props) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  return (
    <div className="chip-group" role="group" aria-label={label}>
      {allLabel && (
        <button
          type="button"
          aria-pressed={selected.length === 0}
          className={`chip${selected.length === 0 ? ' chip--active' : ''}`}
          onClick={() => onChange([])}
        >
          {allLabel}
          {allCount !== undefined && <> <span className="chip__count">{allCount}</span></>}
        </button>
      )}
      {categories.map((category) => {
        const active = selected.includes(category.id)
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={active}
            className={`chip${active ? ' chip--active' : ''}`}
            onClick={() => toggle(category.id)}
          >
            {category.name}
            {counts && <> <span className="chip__count">{counts[category.id] ?? 0}</span></>}
          </button>
        )
      })}
    </div>
  )
}
