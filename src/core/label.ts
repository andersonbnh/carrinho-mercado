import type { Item } from './cart'

/** Dados lidos da etiqueta pela IA (valores em reais). */
export interface Etiqueta {
  nome: string
  preco_unitario: number | null
  preco_atacado: number | null
  qtd_atacado: number | null
  ean: string | null
}

const centavos = (v: number | null): number | undefined =>
  v !== null && Number.isFinite(v) && v > 0 ? Math.round(v * 100) : undefined

/** Converte a etiqueta num rascunho de item para o usuário confirmar. */
export function etiquetaParaItem(e: Etiqueta, agora: number = Date.now()): Partial<Item> & { ean: string } {
  const ean = (e.ean ?? '').replace(/\D/g, '')
  const pa = centavos(e.preco_atacado)
  const qa = e.qtd_atacado !== null && Number.isInteger(e.qtd_atacado) && e.qtd_atacado >= 2 ? e.qtd_atacado : undefined
  return {
    ean: /^\d{8,14}$/.test(ean) ? ean : 'm' + agora,
    nome: e.nome.trim(),
    qtd: 1,
    precoUnit: centavos(e.preco_unitario),
    ...(pa !== undefined && qa !== undefined ? { precoAtacado: pa, qtdAtacado: qa } : {}),
  }
}

/** Dados já salvos de um produto (mesmo formato de Produto no store). */
export interface ProdutoSalvo {
  ean: string
  nome: string
  precoUnit: number
  precoAtacado?: number
  qtdAtacado?: number
}

/**
 * Junta a leitura da etiqueta com o produto já salvo: o nome (corrigido pelo usuário) vem do salvo;
 * preço e atacado lidos agora valem mais (são os atuais), senão usa os salvos.
 */
export function mesclarComSalvo(r: Partial<Item> & { ean: string }, salvo?: ProdutoSalvo): Partial<Item> & { ean: string } {
  if (!salvo) return r
  const atacadoNovo = r.precoAtacado !== undefined && r.qtdAtacado !== undefined
  const atacado = atacadoNovo
    ? { precoAtacado: r.precoAtacado, qtdAtacado: r.qtdAtacado }
    : salvo.precoAtacado !== undefined && salvo.qtdAtacado !== undefined
      ? { precoAtacado: salvo.precoAtacado, qtdAtacado: salvo.qtdAtacado }
      : {}
  return { ean: r.ean, nome: salvo.nome, qtd: r.qtd ?? 1, precoUnit: r.precoUnit ?? salvo.precoUnit, ...atacado }
}
