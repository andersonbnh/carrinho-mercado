import { describe, it, expect } from 'vitest'
import { etiquetaParaItem } from './label'

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
