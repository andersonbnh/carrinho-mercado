import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { loadCart, saveCart, getProduct, saveProduct, saveHistory, listHistory, removeHistory } from './db'

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
  it('apaga só a compra escolhida do histórico', async () => {
    const compra = (data: string) => ({ data, mercado: 'Assaí', itens: [], total: 100 })
    await saveHistory(compra('2026-11-01T10:00:00.000Z'))
    await saveHistory(compra('2026-11-08T10:00:00.000Z'))
    await removeHistory('2026-11-01T10:00:00.000Z')
    expect((await listHistory()).map((c) => c.data)).toEqual(['2026-11-08T10:00:00.000Z'])
    await removeHistory('nao-existe')
    expect(await listHistory()).toHaveLength(1)
  })
})

import { loadMercado, saveMercado } from './db'
describe('mercado salvo', () => {
  it('padrão Assaí e persiste a troca', async () => {
    expect(await loadMercado()).toBe('Assaí')
    await saveMercado('Atacadão')
    expect(await loadMercado()).toBe('Atacadão')
  })
})
