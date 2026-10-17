import { describe, expect, it } from 'vitest'
import { en } from './en'
import { pt } from './pt'

describe('mensagens', () => {
  it('formata quantidade de dias no singular e plural', () => {
    expect(pt.days(1)).toBe('1 dia')
    expect(pt.days(5)).toBe('5 dias')
    expect(en.days(1)).toBe('1 day')
    expect(en.days(5)).toBe('5 days')
  })

  it('descreve a próxima revisão em linguagem natural', () => {
    expect(pt.reviewWhen(0)).toBe('hoje')
    expect(pt.reviewWhen(1)).toBe('amanhã')
    expect(pt.reviewWhen(5)).toBe('em 5 dias')
    expect(pt.reviewWhen(-1)).toBe('atrasado há 1 dia')
    expect(pt.reviewWhen(-10)).toBe('atrasado há 10 dias')
    expect(en.reviewWhen(0)).toBe('today')
    expect(en.reviewWhen(-10)).toBe('overdue by 10 days')
  })

  it('mantém as listas com o mesmo tamanho nos dois idiomas', () => {
    expect(en.demo.cards).toHaveLength(pt.demo.cards.length)
    expect(en.landing.benefits.items).toHaveLength(pt.landing.benefits.items.length)
    expect(en.landing.features.items).toHaveLength(pt.landing.features.items.length)
    expect(en.landing.free.points).toHaveLength(pt.landing.free.points.length)
  })
})
