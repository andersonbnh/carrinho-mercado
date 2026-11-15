import { describe, it, expect } from 'vitest'
import { parseBRL, fmt } from './money'

describe('money', () => {
  it('parse vírgula e ponto', () => {
    expect(parseBRL('5,90')).toBe(590)
    expect(parseBRL('5.9')).toBe(590)
    expect(parseBRL(' 12 ')).toBe(1200)
  })
  it('parse inválido → undefined', () => {
    expect(parseBRL('')).toBeUndefined()
    expect(parseBRL('abc')).toBeUndefined()
    expect(parseBRL('-3')).toBeUndefined()
  })
  it('fmt', () => expect(fmt(1990).replace(/\s/g, ' ')).toBe('R$ 19,90'))
})
