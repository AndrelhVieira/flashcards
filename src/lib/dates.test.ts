import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  INTERVALS,
  addDays,
  daysUntil,
  isDue,
  nextInterval,
  toLocalDate,
  today,
} from './dates'

describe('dates', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 23h30 locais: garante que não usamos UTC (que já seria o dia seguinte no Brasil).
    vi.setSystemTime(new Date(2026, 9, 12, 23, 30))
  })

  afterEach(() => vi.useRealTimers())

  it('formata datas locais como YYYY-MM-DD', () => {
    expect(toLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(today()).toBe('2026-10-12')
  })

  it('soma dias atravessando mês e ano', () => {
    expect(addDays(1)).toBe('2026-10-13')
    expect(addDays(30)).toBe('2026-11-11')
    expect(addDays(1, new Date(2026, 11, 31))).toBe('2027-01-01')
    expect(addDays(-1)).toBe('2026-10-11')
  })

  it('considera vencido o card de hoje ou de datas passadas', () => {
    expect(isDue('2026-10-11')).toBe(true)
    expect(isDue('2026-10-12')).toBe(true)
    expect(isDue('2026-10-13')).toBe(false)
    expect(isDue('2026-10-13', '2026-10-13')).toBe(true)
  })

  it('sugere o próximo intervalo da escada', () => {
    expect(nextInterval(1)).toBe(3)
    expect(nextInterval(3)).toBe(5)
    expect(nextInterval(4)).toBe(5)
    expect(nextInterval(60)).toBe(60)
    expect(nextInterval(365)).toBe(INTERVALS[INTERVALS.length - 1])
  })

  it('conta os dias até a próxima revisão', () => {
    expect(daysUntil('2026-10-12')).toBe(0)
    expect(daysUntil('2026-10-13')).toBe(1)
    expect(daysUntil('2026-10-17')).toBe(5)
    expect(daysUntil('2026-10-11')).toBe(-1)
  })
})
