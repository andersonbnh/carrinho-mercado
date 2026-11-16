import { listHistory } from '../store/db'
import { mercadosRecentes, nomeMercado } from '../core/mercado'
import { state, setMercado } from '../state'
import { esc, toast } from './dom'

/** Diálogo para trocar o mercado da compra atual, sugerindo os já usados. */
export async function openMercado() {
  const recentes = mercadosRecentes(await listHistory()).filter((m) => m !== state.mercado)
  const d = document.createElement('dialog')
  d.innerHTML = `<form method="dialog">
    <h3>Em qual mercado você está?</h3>
    <label>Nome do mercado</label>
    <input name="m" maxlength="30" value="${esc(state.mercado)}" />
    ${recentes.length ? `<label>Já usados</label><div class="row" style="flex-wrap:wrap;gap:6px">${recentes.map((m) => `<button type="button" class="btn" data-m="${esc(m)}" style="padding:0 12px;font-size:15px">${esc(m)}</button>`).join('')}</div>` : ''}
    <small>Vale para esta compra e as próximas, até você trocar. Fica salvo no histórico.</small>
    <div class="row" style="margin-top:14px"><button class="btn" value="cancel" style="flex:1">Cancelar</button><button class="btn pri" value="ok" style="flex:2">Salvar</button></div>
  </form>`
  document.body.append(d)
  const f = d.querySelector('form')!
  const input = f.elements.namedItem('m') as HTMLInputElement
  d.querySelectorAll<HTMLElement>('[data-m]').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.m! }))
  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    if ((e.submitter as HTMLButtonElement | null)?.value === 'ok') {
      const nome = nomeMercado(input.value)
      if (nome !== state.mercado) {
        await setMercado(nome)
        toast('Mercado: ' + nome)
      }
    }
    d.close()
    d.remove() // não depender do evento 'close' (nem sempre dispara)
  })
  d.addEventListener('close', () => d.remove())
  d.showModal()
}
