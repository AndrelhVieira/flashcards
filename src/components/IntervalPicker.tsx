import { INTERVALS } from '../lib/dates'
import { useI18n } from '../i18n/context'

interface Props {
  value: number | null
  onChange: (days: number) => void
  suggested?: number
  label: string
}

export function IntervalPicker({ value, onChange, suggested, label }: Props) {
  const { t } = useI18n()
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
          title={suggested === days ? t.interval.suggested : undefined}
        >
          {t.days(days)}
        </button>
      ))}
    </div>
  )
}
