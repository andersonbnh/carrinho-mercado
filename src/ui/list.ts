import { state, setList } from '../state'
import { esc } from './dom'

export function renderList(view: HTMLElement) {
  view.innerHTML = `
    <div class="row"><input id="novo" placeholder="Adicionar à lista (ex.: leite)" /><button class="btn pri" id="add">+</button></div>
    ${state.list.length ? '' : '<div class="empty">Lista vazia. Itens são marcados quando você escaneia o produto.</div>'}
    ${state.list.map((l, n) => `<div class="card row"><input type="checkbox" style="width:24px;height:24px" data-c="${n}" ${l.feito ? 'checked' : ''}>
      <span style="flex:1" class="${l.feito ? 'done' : ''}">${esc(l.nome)}</span><button class="btn" data-d="${n}">✕</button></div>`).join('')}
    ${state.list.some((l) => l.feito) ? '<button class="btn" id="clr" style="width:100%;margin-top:8px">Limpar marcados</button>' : ''}`
  const add = () => {
    const nome = view.querySelector<HTMLInputElement>('#novo')!.value.trim()
    if (nome) setList([...state.list, { nome, feito: false }])
  }
  view.querySelector('#add')!.addEventListener('click', add)
  view.querySelector('#novo')!.addEventListener('keydown', (e) => (e as KeyboardEvent).key === 'Enter' && add())
  view.querySelectorAll<HTMLInputElement>('[data-c]').forEach((c) => c.addEventListener('change', () =>
    setList(state.list.map((x, n) => (n === +c.dataset.c! ? { ...x, feito: c.checked } : x)))))
  view.querySelectorAll<HTMLElement>('[data-d]').forEach((b) => b.addEventListener('click', () =>
    setList(state.list.filter((_, n) => n !== +b.dataset.d!))))
  view.querySelector('#clr')?.addEventListener('click', () => setList(state.list.filter((x) => !x.feito)))
}
