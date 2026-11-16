import { get, set } from 'idb-keyval'
import type { Item } from '../core/cart'

export interface Produto {
  ean: string
  nome: string
  precoUnit: number
  precoAtacado?: number
  qtdAtacado?: number
}
export interface Compra {
  data: string
  mercado: string
  itens: Item[]
  total: number
}
export interface ItemLista {
  nome: string
  ean?: string
  feito: boolean
}

export const loadCart = async (): Promise<Item[]> => (await get<Item[]>('cart')) ?? []
export const saveCart = (i: Item[]) => set('cart', i)
export const getProduct = (ean: string) => get<Produto>('p:' + ean)
export const saveProduct = (p: Produto) => set('p:' + p.ean, p)
export const listHistory = async (): Promise<Compra[]> => (await get<Compra[]>('hist')) ?? []
export const saveHistory = async (c: Compra) => set('hist', [c, ...(await listHistory())])
/** Remove a compra identificada pela data/hora em que foi salva. */
export const removeHistory = async (data: string) => set('hist', (await listHistory()).filter((c) => c.data !== data))
export const loadList = async (): Promise<ItemLista[]> => (await get<ItemLista[]>('list')) ?? []
export const saveList = (l: ItemLista[]) => set('list', l)
export const loadLimit = async (): Promise<number | undefined> => get<number>('limit')
export const saveLimit = (n: number) => set('limit', n)
export const loadApiKey = async (): Promise<string | undefined> => get<string>('apiKey')
export const saveApiKey = (k: string | undefined) => set('apiKey', k)
