import { addItem, cartTotal, lineTotal, limitStatus, unitPrice, type Item } from '../core/cart'
import { compare } from '../core/priceMemory'
import { lookupName } from '../core/lookup'
import { fmt, parseBRL } from '../core/money'
import { getProduct, saveProduct, saveHistory, loadApiKey } from '../store/db'
import { etiquetaParaItem } from '../core/label'
import { takePhoto } from './photo'
import { openSettings } from './settings'
import { state, setCart, setLimite, setList } from '../state'
import { esc, toast } from './dom'
import { itemModal } from './priceModal'
import { scanCode } from './scanner'

const produtoDe = (i: Item) => ({ ean: i.ean, nome: i.nome, precoUnit: i.precoUnit, precoAtacado: i.precoAtacado, qtdAtacado: i.qtdAtacado })

async function marcarNaLista(i: Item) {
  const nome = i.nome.toLowerCase()
  const l = state.list.map((x) => (!x.feito && (x.ean === i.ean || nome.includes(x.nome.toLowerCase())) ? { ...x, feito: true } : x))
  if (l.some((x, n) => x.feito !== state.list[n].feito)) await setList(l)
}

export async function handleEan(ean: string) {
  if (!/^\d{6,14}$/.test(ean)) return toast('Código inválido: ' + ean)
  const prod = await getProduct(ean)
  if (prod) {
    const item: Item = { ...prod, qtd: 1 }
    await setCart(addItem(state.cart, item))
    await marcarNaLista(item)
    return toast(`${prod.nome} — ${fmt(prod.precoUnit)} (última vez)`)
  }
  toast('Buscando nome…')
  const nome = (await lookupName(ean)) ?? ''
  const item = await itemModal({ ean, nome }, 'Novo produto')
  if (!item) return
  await saveProduct(produtoDe(item))
  await setCart(addItem(state.cart, item))
  await marcarNaLista(item)
}

/** Tela de espera com contador de segundos e botão Cancelar. Devolve o sinal de cancelamento e a função que fecha a tela. */
function carregando(msg: string): { signal: AbortSignal; fim: () => void } {
  const ac = new AbortController()
  const el = document.createElement('div')
  el.className = 'loading'
  el.innerHTML = `<div><div class="msg"></div><button class="btn">Cancelar</button></div>`
  const txt = el.querySelector<HTMLElement>('.msg')!
  const t0 = Date.now()
  const tick = () => { txt.textContent = `${msg} ${Math.floor((Date.now() - t0) / 1000)} s` }
  tick()
  const iv = setInterval(tick, 1000)
  el.querySelector('button')!.addEventListener('click', () => ac.abort())
  document.body.append(el)
  return { signal: ac.signal, fim: () => { clearInterval(iv); el.remove() } }
}

export async function handleLabel() {
  const key = await loadApiKey()
  if (!key) {
    toast('Configure a chave da API primeiro')
    return openSettings()
  }
  const foto = await takePhoto()
  if (!foto) return
  const { signal, fim } = carregando('🏷️ Lendo etiqueta…')
  let rascunho
  try {
    const { readLabel } = await import('../ai/readLabel')
    rascunho = etiquetaParaItem(await readLabel(foto, key, { signal }))
  } catch (e) {
    return toast((e as Error).message)
  } finally {
    fim()
  }
  const prod = rascunho.ean.startsWith('m') ? undefined : await getProduct(rascunho.ean)
  const item = await itemModal(rascunho, 'Confira a etiqueta', prod?.precoUnit)
  if (!item) return
  const r = compare(item.precoUnit, prod?.precoUnit)
  if (!item.ean.startsWith('m')) await saveProduct(produtoDe(item))
  await setCart(addItem(state.cart, item))
  await marcarNaLista(item)
  if (r === 'mais caro' || r === 'mais barato') toast(`Preço ${r} que da última vez`)
}

async function editar(idx: number) {
  const atual = state.cart[idx]
  const prod = await getProduct(atual.ean)
  const novo = await itemModal(atual, 'Editar item', prod?.precoUnit)
  if (!novo) return
  const r = compare(novo.precoUnit, prod?.precoUnit)
  await saveProduct(produtoDe(novo))
  await setCart(state.cart.map((x, n) => (n === idx ? novo : x)))
  if (r === 'mais caro' || r === 'mais barato') toast(`Preço ${r} que da última vez`)
}

async function finalizar() {
  if (!state.cart.length) return
  if (!confirm(`Finalizar compra de ${fmt(cartTotal(state.cart))}?`)) return
  await saveHistory({ data: new Date().toISOString(), mercado: 'Assaí', itens: state.cart, total: cartTotal(state.cart) })
  await setCart([])
  toast('Compra salva no histórico')
}

export function renderCart(view: HTMLElement) {
  const total = cartTotal(state.cart)
  const ls = limitStatus(total, state.limite)
  const qtdTotal = state.cart.reduce((s, i) => s + i.qtd, 0)
  view.innerHTML = `
    <div class="total"><small>TOTAL DO CARRINHO</small><div class="v">${fmt(total)}</div>
    <small>${qtdTotal} un. · ${state.cart.length} itens</small></div>
    <div class="card">
      <div class="row"><label style="margin:0;flex:1">Limite de gasto (R$)</label>
      <input id="lim" inputmode="decimal" style="width:120px" value="${state.limite ? (state.limite / 100).toFixed(2).replace('.', ',') : ''}" placeholder="0,00" /></div>
      ${ls ? `<div class="bar"><i class="${ls.cor}" style="width:${Math.min(100, ls.ratio * 100)}%"></i></div>
      <small>${ls.falta >= 0 ? 'Faltam ' + fmt(ls.falta) : 'Estourou em ' + fmt(-ls.falta)}</small>` : ''}
    </div>
    ${state.cart.length ? '' : '<div class="empty">Carrinho vazio.<br>Bipe o código ou fotografe a etiqueta.</div>'}
    ${state.cart.map((i, n) => `
      <div class="card item row">
        <div class="nome" data-edit="${n}"><b>${esc(i.nome)}</b>
          <small>${fmt(unitPrice(i))} un.${i.precoAtacado !== undefined && i.qtd >= (i.qtdAtacado ?? Infinity) ? ' <span class="tag">atacado</span>' : i.qtdAtacado ? ` · atacado ${fmt(i.precoAtacado!)} a partir de ${i.qtdAtacado}` : ''}</small></div>
        <div class="qty"><button data-dec="${n}">−</button><b>${i.qtd}</b><button data-inc="${n}">+</button></div>
        <b style="min-width:76px;text-align:right">${fmt(lineTotal(i))}</b>
      </div>`).join('')}
    <div class="row" style="margin-top:12px"><button class="btn" id="manual" style="flex:1">+ Item manual</button><button class="btn" id="fin" style="flex:1">Finalizar</button></div>
    <div class="fabs"><button class="btn pri" id="scan">📷 Código</button><button class="btn pri" id="etq">🏷️ Etiqueta</button></div>`

  view.querySelector('#lim')!.addEventListener('change', (e) => {
    const v = parseBRL((e.target as HTMLInputElement).value)
    setLimite(v ?? 0)
  })
  view.querySelectorAll<HTMLElement>('[data-inc]').forEach((b) => b.addEventListener('click', () =>
    setCart(state.cart.map((x, n) => (n === +b.dataset.inc! ? { ...x, qtd: x.qtd + 1 } : x)))))
  view.querySelectorAll<HTMLElement>('[data-dec]').forEach((b) => b.addEventListener('click', () => {
    const n = +b.dataset.dec!
    setCart(state.cart[n].qtd <= 1 ? state.cart.filter((_, k) => k !== n) : state.cart.map((x, k) => (k === n ? { ...x, qtd: x.qtd - 1 } : x)))
  }))
  view.querySelectorAll<HTMLElement>('[data-edit]').forEach((b) => b.addEventListener('click', () => editar(+b.dataset.edit!)))
  view.querySelector('#scan')!.addEventListener('click', async () => { const c = await scanCode(); if (c) await handleEan(c) })
  view.querySelector('#etq')!.addEventListener('click', handleLabel)
  view.querySelector('#manual')!.addEventListener('click', async () => {
    const item = await itemModal({ ean: 'm' + Date.now() }, 'Item manual')
    if (item) await setCart(addItem(state.cart, item))
  })
  view.querySelector('#fin')!.addEventListener('click', finalizar)
}
