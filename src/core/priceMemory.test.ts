import { describe, it, expect } from 'vitest'
import { compare } from './priceMemory'

describe('compare', () => {
  it('novo', () => expect(compare(500, undefined)).toBe('novo'))
  it('igual', () => expect(compare(500, 500)).toBe('igual'))
  it('mais caro', () => expect(compare(600, 500)).toBe('mais caro'))
  it('mais barato', () => expect(compare(400, 500)).toBe('mais barato'))
})
