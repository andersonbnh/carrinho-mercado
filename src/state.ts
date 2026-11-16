import { loadCart, saveCart, loadLimit, saveLimit, loadList, saveList, loadMercado, saveMercado, type ItemLista } from './store/db'
import type { Item } from './core/cart'
import { MERCADO_PADRAO } from './core/mercado'

export const state = {
  cart: [] as Item[],
  limite: undefined as number | undefined,
  list: [] as ItemLista[],
  mercado: MERCADO_PADRAO,
}
let listener: () => void = () => {}
export const onChange = (f: () => void) => (listener = f)

export async function init() {
  state.cart = await loadCart()
  state.limite = await loadLimit()
  state.list = await loadList()
  state.mercado = await loadMercado()
}
export async function setCart(c: Item[]) { state.cart = c; await saveCart(c); listener() }
export async function setLimite(n: number) { state.limite = n; await saveLimit(n); listener() }
export async function setList(l: ItemLista[]) { state.list = l; await saveList(l); listener() }
export async function setMercado(nome: string) { state.mercado = nome; await saveMercado(nome); listener() }
