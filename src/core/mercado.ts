export const MERCADO_PADRAO = 'Assaí'

/** Normaliza o nome digitado: sem espaços nas pontas, até 30 caracteres; vazio volta ao padrão. */
export function nomeMercado(s: string): string {
  const t = s.trim().slice(0, 30)
  return t || MERCADO_PADRAO
}

/** Mercados já usados no histórico (mais recente primeiro), sem repetir. */
export function mercadosRecentes(hist: { mercado: string }[]): string[] {
  const vistos = new Set<string>()
  const out: string[] = []
  for (const { mercado } of hist) {
    const nome = mercado.trim()
    const chave = nome.toLocaleLowerCase('pt-BR')
    if (!nome || vistos.has(chave)) continue
    vistos.add(chave)
    out.push(nome)
  }
  return out
}
