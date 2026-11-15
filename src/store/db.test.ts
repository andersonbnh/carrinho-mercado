import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { loadCart, saveCart, getProduct, saveProduct } from './db'

describe('db', () => {
  it('carrinho vazio por padrão e persiste', async () => {
    expect(await loadCart()).toEqual([])
    await saveCart([{ ean: '1', nome: 'Leite', qtd: 2, precoUnit: 500 }])
    expect((await loadCart())[0].qtd).toBe(2)
  })
  it('produto salvo é recuperado', async () => {
    expect(await getProduct('9')).toBeUndefined()
    await saveProduct({ ean: '9', nome: 'Arroz', precoUnit: 2500 })
    expect((await getProduct('9'))?.precoUnit).toBe(2500)
  })
})
