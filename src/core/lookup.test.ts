import { describe, it, expect } from 'vitest'
import { lookupName } from './lookup'

const resp = (body: unknown) => (async () => ({ ok: true, json: async () => body })) as unknown as typeof fetch

describe('lookupName', () => {
  it('retorna nome quando achou', async () =>
    expect(await lookupName('1', resp({ status: 1, product: { product_name: 'Leite' } }))).toBe('Leite'))
  it('null quando status 0', async () =>
    expect(await lookupName('1', resp({ status: 0 }))).toBeNull())
  it('null quando offline', async () =>
    expect(await lookupName('1', (async () => { throw new Error('off') }) as unknown as typeof fetch)).toBeNull())
})
