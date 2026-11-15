import { describe, it, expect } from 'vitest'
import { unitPrice, lineTotal, cartTotal, addItem, limitStatus, type Item } from './cart'

const leite: Item = { ean: '1', nome: 'Leite', qtd: 3, precoUnit: 1000 }
const arroz: Item = { ean: '2', nome: 'Arroz', qtd: 2, precoUnit: 1000, precoAtacado: 850, qtdAtacado: 3 }

describe('cart', () => {
  it('lineTotal unitário', () => expect(lineTotal(leite)).toBe(3000))
  it('atacado não vale abaixo do mínimo', () => {
    expect(unitPrice(arroz)).toBe(1000)
    expect(lineTotal(arroz)).toBe(2000)
  })
  it('atacado vale a partir do mínimo', () => {
    expect(lineTotal({ ...arroz, qtd: 3 })).toBe(2550)
  })
  it('cartTotal soma linhas', () => expect(cartTotal([leite, arroz])).toBe(5000))
  it('addItem mesmo ean soma qtd', () => {
    const r = addItem([leite], { ...leite, qtd: 1 })
    expect(r).toHaveLength(1)
    expect(r[0].qtd).toBe(4)
  })
  it('addItem ean novo adiciona linha', () => expect(addItem([leite], arroz)).toHaveLength(2))
  it('rejeita qtd <= 0, preço negativo ou NaN', () => {
    expect(() => addItem([], { ...leite, qtd: 0 })).toThrow()
    expect(() => addItem([], { ...leite, precoUnit: -1 })).toThrow()
    expect(() => addItem([], { ...leite, precoUnit: NaN })).toThrow()
  })
  it('limitStatus sem limite → null', () => {
    expect(limitStatus(500, undefined)).toBeNull()
    expect(limitStatus(500, 0)).toBeNull()
  })
  it('limitStatus cores', () => {
    expect(limitStatus(790, 1000)?.cor).toBe('verde')
    expect(limitStatus(800, 1000)?.cor).toBe('amarelo')
    expect(limitStatus(1000, 1000)?.cor).toBe('vermelho')
    expect(limitStatus(1200, 1000)?.falta).toBe(-200)
  })
})
