import { describe, it, expect } from 'vitest'
import { mercadosRecentes, nomeMercado } from './mercado'

const c = (mercado: string) => ({ data: '', mercado, itens: [], total: 0 })

describe('mercado', () => {
  it('recentes: sem repetir, mais recente primeiro, ignorando maiúsculas/espaços', () => {
    expect(mercadosRecentes([c('Atacadão'), c('Assaí'), c(' atacadão '), c('Carrefour')])).toEqual(['Atacadão', 'Assaí', 'Carrefour'])
  })
  it('recentes: histórico vazio', () => expect(mercadosRecentes([])).toEqual([]))
  it('nomeMercado: limpa espaços e limita tamanho; vazio volta ao padrão', () => {
    expect(nomeMercado('  Atacadão  ')).toBe('Atacadão')
    expect(nomeMercado('   ')).toBe('Assaí')
    expect(nomeMercado('x'.repeat(50))).toHaveLength(30)
  })
})
