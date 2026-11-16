import { describe, it, expect } from 'vitest'
import { etiquetaParaItem, mesclarComSalvo } from './label'

const base = { nome: 'Arroz Tio João 5kg', preco_unitario: 27.9, preco_atacado: 25.49, qtd_atacado: 3, ean: '7893500018469' }

describe('etiquetaParaItem', () => {
  it('converte reais em centavos e mantém atacado', () => {
    expect(etiquetaParaItem(base, 1)).toEqual({
      ean: '7893500018469', nome: 'Arroz Tio João 5kg', qtd: 1, precoUnit: 2790, precoAtacado: 2549, qtdAtacado: 3,
    })
  })
  it('sem atacado quando falta preço ou quantidade', () => {
    const r = etiquetaParaItem({ ...base, qtd_atacado: null }, 1)
    expect(r.precoAtacado).toBeUndefined()
    expect(r.qtdAtacado).toBeUndefined()
  })
  it('ignora atacado com qtd < 2 ou preço inválido', () => {
    expect(etiquetaParaItem({ ...base, qtd_atacado: 1 }, 1).precoAtacado).toBeUndefined()
    expect(etiquetaParaItem({ ...base, preco_atacado: 0 }, 1).precoAtacado).toBeUndefined()
  })
  it('preço unitário ausente/negativo fica indefinido (usuário digita)', () => {
    expect(etiquetaParaItem({ ...base, preco_unitario: null }, 1).precoUnit).toBeUndefined()
    expect(etiquetaParaItem({ ...base, preco_unitario: -5 }, 1).precoUnit).toBeUndefined()
  })
  it('EAN inválido vira id manual', () => {
    expect(etiquetaParaItem({ ...base, ean: '123' }, 42).ean).toBe('m42')
    expect(etiquetaParaItem({ ...base, ean: null }, 42).ean).toBe('m42')
  })
  it('EAN com espaços é limpo', () => {
    expect(etiquetaParaItem({ ...base, ean: '7 893500 018469' }, 1).ean).toBe('7893500018469')
  })
})

describe('mesclarComSalvo', () => {
  const salvo = { ean: '789', nome: 'Feijão Carioca Kicaldo 1kg', precoUnit: 899, precoAtacado: 799, qtdAtacado: 6 }

  it('sem produto salvo, mantém o que a IA leu', () => {
    const r = { ean: '789', nome: 'FEIJAO KICALDO', qtd: 1, precoUnit: 950 }
    expect(mesclarComSalvo(r, undefined)).toEqual(r)
  })
  it('usa nome e atacado salvos, e o preço atual lido da etiqueta', () => {
    expect(mesclarComSalvo({ ean: '789', nome: 'FEIJAO KICALDO', qtd: 1, precoUnit: 950 }, salvo)).toEqual({
      ean: '789', nome: 'Feijão Carioca Kicaldo 1kg', qtd: 1, precoUnit: 950, precoAtacado: 799, qtdAtacado: 6,
    })
  })
  it('se a IA não leu o preço, usa o preço salvo', () => {
    expect(mesclarComSalvo({ ean: '789', nome: 'X', qtd: 1, precoUnit: undefined }, salvo).precoUnit).toBe(899)
  })
  it('atacado lido agora na etiqueta substitui o salvo', () => {
    const r = mesclarComSalvo({ ean: '789', nome: 'X', qtd: 1, precoUnit: 950, precoAtacado: 850, qtdAtacado: 5 }, salvo)
    expect([r.precoAtacado, r.qtdAtacado]).toEqual([850, 5])
  })
})
