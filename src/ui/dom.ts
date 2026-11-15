export function toast(msg: string) {
  const t = document.getElementById('toast')!
  t.textContent = msg
  t.classList.add('on')
  setTimeout(() => t.classList.remove('on'), 2500)
}
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
