/** Valores monetários em centavos (inteiros). */
export interface Item {
  ean: string
  nome: string
  qtd: number
  precoUnit: number
  precoAtacado?: number
  qtdAtacado?: number
}

export const unitPrice = (i: Item): number =>
  i.precoAtacado !== undefined && i.qtdAtacado !== undefined && i.qtd >= i.qtdAtacado
    ? i.precoAtacado
    : i.precoUnit

export const lineTotal = (i: Item): number => unitPrice(i) * i.qtd

export const cartTotal = (items: Item[]): number =>
  items.reduce((s, i) => s + lineTotal(i), 0)

function validate(i: Item): void {
  if (!Number.isFinite(i.qtd) || i.qtd <= 0) throw new Error('Quantidade inválida')
  if (!Number.isFinite(i.precoUnit) || i.precoUnit < 0) throw new Error('Preço inválido')
}

export function addItem(items: Item[], novo: Item): Item[] {
  validate(novo)
  const idx = items.findIndex((i) => i.ean === novo.ean)
  if (idx === -1) return [...items, novo]
  return items.map((i, n) => (n === idx ? { ...i, qtd: i.qtd + novo.qtd } : i))
}

export interface LimitStatus {
  ratio: number
  falta: number
  cor: 'verde' | 'amarelo' | 'vermelho'
}

export function limitStatus(total: number, limite?: number): LimitStatus | null {
  if (!limite || limite <= 0) return null
  const ratio = total / limite
  return { ratio, falta: limite - total, cor: ratio >= 1 ? 'vermelho' : ratio >= 0.8 ? 'amarelo' : 'verde' }
}
