import './styles.css'
import { init, onChange } from './state'
import { renderCart } from './ui/cart'
import { renderList } from './ui/list'
import { renderHistory } from './ui/history'
import { openSettings } from './ui/settings'

// Após uma atualização, a página antiga pode pedir um pedaço de código que não existe mais no servidor.
// Recomendação do Vite: recarregar para pegar a versão nova (uma vez só, para não entrar em loop offline).
window.addEventListener('vite:preloadError', (e) => {
  try {
    if (sessionStorage.getItem('recarregou')) return
    sessionStorage.setItem('recarregou', '1')
  } catch { /* sem storage: recarrega mesmo assim */ }
  e.preventDefault()
  location.reload()
})

const view = document.getElementById('view')!
let tab: 'cart' | 'list' | 'hist' = 'cart'

function render() {
  document.querySelectorAll<HTMLElement>('nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab))
  if (tab === 'cart') renderCart(view)
  else if (tab === 'list') renderList(view)
  else renderHistory(view)
}

document.querySelectorAll<HTMLElement>('nav button').forEach((b) =>
  b.addEventListener('click', () => { tab = b.dataset.tab as typeof tab; render() }))
document.getElementById('cfg')!.addEventListener('click', openSettings)
onChange(render)
init().then(render)
