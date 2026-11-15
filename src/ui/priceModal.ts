import type { Item } from '../core/cart'
import { parseBRL } from '../core/money'
import { esc, toast } from './dom'

const reais = (c?: number) => (c === undefined ? '' : (c / 100).toFixed(2).replace('.', ','))

/** Abre diálogo de item. Retorna o item validado ou null se cancelado. */
export function itemModal(base: Partial<Item> & { ean: string }, titulo: string, ultimo?: number): Promise<Item | null> {
  return new Promise((resolve) => {
    const d = document.createElement('dialog')
    d.innerHTML = `<form method="dialog">
      <h3>${esc(titulo)}</h3>
      ${ultimo !== undefined ? `<small>Última vez: ${(ultimo / 100).toFixed(2).replace('.', ',')}</small>` : ''}
      <label>Nome</label><input name="nome" value="${esc(base.nome ?? '')}" />
      <label>Preço unitário (R$)</label><input name="preco" inputmode="decimal" autofocus value="${reais(base.precoUnit)}" />
      <label>Quantidade</label><input name="qtd" inputmode="numeric" value="${base.qtd ?? 1}" />
      <label>Preço atacado (R$) — opcional</label><input name="pa" inputmode="decimal" value="${reais(base.precoAtacado)}" />
      <label>Atacado a partir de (unid.)</label><input name="qa" inputmode="numeric" value="${base.qtdAtacado ?? ''}" />
      <div class="row" style="margin-top:14px"><button class="btn" value="cancel" style="flex:1">Cancelar</button><button class="btn pri" value="ok" style="flex:2">Salvar</button></div>
    </form>`
    document.body.append(d)
    const f = d.querySelector('form')!
    const val = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value
    let done = false
    const finish = (r: Item | null) => {
      if (done) return
      done = true
      if (d.open) d.close()
      d.remove()
      resolve(r)
    }
    f.addEventListener('submit', (e) => {
      e.preventDefault()
      const ok = (e.submitter as HTMLButtonElement | null)?.value === 'ok'
      if (!ok) return finish(null)
      const preco = parseBRL(val('preco'))
      const qtd = parseInt(val('qtd'), 10)
      const pa = parseBRL(val('pa'))
      const qa = parseInt(val('qa'), 10)
      if (preco === undefined || !(qtd > 0)) return toast('Informe preço e quantidade válidos')
      const atacado = pa !== undefined && qa > 0
      finish({
        ean: base.ean,
        nome: val('nome').trim() || 'Produto ' + base.ean,
        qtd, precoUnit: preco,
        ...(atacado ? { precoAtacado: pa, qtdAtacado: qa } : {}),
      })
    })
    d.addEventListener('close', () => finish(null))
    d.showModal()
  })
}
