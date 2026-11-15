import { loadCart, saveCart, loadLimit, saveLimit, loadList, saveList, type ItemLista } from './store/db'
import type { Item } from './core/cart'

export const state = { cart: [] as Item[], limite: undefined as number | undefined, list: [] as ItemLista[] }
let listener: () => void = () => {}
export const onChange = (f: () => void) => (listener = f)

export async function init() {
  state.cart = await loadCart()
  state.limite = await loadLimit()
  state.list = await loadList()
}
export async function setCart(c: Item[]) { state.cart = c; await saveCart(c); listener() }
export async function setLimite(n: number) { state.limite = n; await saveLimit(n); listener() }
export async function setList(l: ItemLista[]) { state.list = l; await saveList(l); listener() }
