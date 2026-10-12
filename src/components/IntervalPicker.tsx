import { INTERVALS, formatDays } from '../lib/dates'

interface Props {
  value: number | null
  onChange: (days: number) => void
  suggested?: number
  label: string
}

export function IntervalPicker({ value, onChange, suggested, label }: Props) {
  return (
    <div className="interval-picker" role="radiogroup" aria-label={label}>
      {INTERVALS.map((days) => (
        <button
          key={days}
          type="button"
          role="radio"
          aria-checked={value === days}
          className={`chip${value === days ? ' chip--active' : ''}${suggested === days ? ' chip--suggested' : ''}`}
          onClick={() => onChange(days)}
          title={suggested === days ? 'Sugerido' : undefined}
        >
          {formatDays(days)}
        </button>
      ))}
    </div>
  )
}
