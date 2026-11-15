export type Comparacao = 'novo' | 'igual' | 'mais caro' | 'mais barato'

export function compare(atual: number, ultimo?: number): Comparacao {
  if (ultimo === undefined) return 'novo'
  if (atual === ultimo) return 'igual'
  return atual > ultimo ? 'mais caro' : 'mais barato'
}
