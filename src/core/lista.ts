export interface ItemLista {
  nome: string
  ean?: string
  feito: boolean
}

/** Minúsculas, sem acentos e com espaços simples: "  Feijão  Carioca" → "feijao carioca". */
export const normalizar = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

/** Marca na lista os itens que batem com o produto adicionado (pelo código ou pelo nome). */
export function marcarLista(lista: ItemLista[], nomeProduto: string, ean: string): ItemLista[] {
  const produto = normalizar(nomeProduto)
  return lista.map((x) => {
    if (x.feito) return x
    const alvo = normalizar(x.nome)
    const bate = (x.ean !== undefined && x.ean === ean) || (alvo !== '' && produto.includes(alvo))
    return bate ? { ...x, feito: true } : x
  })
}
