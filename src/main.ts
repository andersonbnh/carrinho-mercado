import './styles.css'
import { init, onChange } from './state'
import { renderCart } from './ui/cart'
import { renderList } from './ui/list'
import { renderHistory } from './ui/history'
import { openSettings } from './ui/settings'

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
