import { listHistory } from '../store/db'
import { fmt } from '../core/money'
import { esc, toast } from './dom'

export async function renderHistory(view: HTMLElement) {
  const h = await listHistory()
  view.innerHTML = h.length
    ? h.map((c, n) => `<div class="card"><div class="row"><b style="flex:1">${new Date(c.data).toLocaleDateString('pt-BR')} · ${esc(c.mercado)}</b><b>${fmt(c.total)}</b></div>
    <small>${c.itens.length} itens</small><br><button class="btn" data-s="${n}" style="margin-top:8px">Compartilhar</button></div>`).join('')
    : '<div class="empty">Nenhuma compra salva ainda.</div>'
  view.querySelectorAll<HTMLElement>('[data-s]').forEach((b) => b.addEventListener('click', async () => {
    const c = h[+b.dataset.s!]
    const txt = `Compra ${c.mercado} ${new Date(c.data).toLocaleDateString('pt-BR')}\n` +
      c.itens.map((i) => `${i.qtd}x ${i.nome}`).join('\n') + `\nTotal: ${fmt(c.total)}`
    try {
      if (navigator.share) await navigator.share({ text: txt })
      else { await navigator.clipboard.writeText(txt); toast('Copiado') }
    } catch { /* cancelado */ }
  }))
}
