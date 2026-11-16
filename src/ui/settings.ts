import { loadApiKey, saveApiKey } from '../store/db'
import { toast } from './dom'

/** Diálogo para colar/remover a chave da API do Google Gemini (guardada só neste aparelho). */
export async function openSettings() {
  const atual = await loadApiKey()
  const d = document.createElement('dialog')
  d.innerHTML = `<form method="dialog">
    <h3>Leitura de etiqueta (IA)</h3>
    <small>Status: ${atual ? 'chave configurada ✓' : 'sem chave'}</small>
    <label>Chave da API do Google (Gemini)</label>
    <input name="k" type="password" autocomplete="off" placeholder="${atual ? 'Colar nova chave para trocar' : 'Cole sua chave aqui'}" />
    <small>Fica guardada só neste celular. Crie grátis em aistudio.google.com → Get API key.</small>
    <div class="row" style="margin-top:14px">
      ${atual ? '<button class="btn" value="del" style="flex:1">Remover</button>' : ''}
      <button class="btn" value="cancel" style="flex:1">Fechar</button>
      <button class="btn pri" value="ok" style="flex:1">Salvar</button>
    </div></form>`
  document.body.append(d)
  const f = d.querySelector('form')!
  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    const acao = (e.submitter as HTMLButtonElement | null)?.value
    const k = (f.elements.namedItem('k') as HTMLInputElement).value.trim()
    if (acao === 'ok') {
      if (!/^\S{20,}$/.test(k)) return toast('Chave inválida: cole a chave completa')
      await saveApiKey(k)
      toast('Chave salva')
    } else if (acao === 'del') {
      await saveApiKey(undefined)
      toast('Chave removida')
    }
    d.close()
    d.remove() // não depender do evento 'close' (nem sempre dispara)
  })
  d.addEventListener('close', () => d.remove())
  d.showModal()
}
