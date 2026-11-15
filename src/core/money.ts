export function parseBRL(s: string): number | undefined {
  const t = s.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(t)) return undefined
  return Math.round(parseFloat(t) * 100)
}
export const fmt = (c: number): string =>
  (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
