import { describe, it, expect } from 'vitest'
import { marcarLista } from './lista'

const lista = (...nomes: string[]) => nomes.map((nome) => ({ nome, feito: false }))

describe('marcarLista', () => {
  it('marca quando o nome do produto contém o item da lista, ignorando maiúsculas', () => {
    expect(marcarLista(lista('arroz', 'café'), 'Arroz Tio João 5kg', 'm1').map((x) => x.feito)).toEqual([true, false])
  })
  it('ignora acentos nos dois sentidos', () => {
    expect(marcarLista(lista('Feijão'), 'FEIJAO CARIOCA KICALDO', '1')[0].feito).toBe(true)
    expect(marcarLista(lista('cafe'), 'Café Pilão 500g', '1')[0].feito).toBe(true)
  })
  it('ignora espaços extras', () => {
    expect(marcarLista(lista('  pão  de   forma '), 'Pão de Forma Wickbold', '1')[0].feito).toBe(true)
  })
  it('marca pelo código de barras quando o item da lista tem código', () => {
    expect(marcarLista([{ nome: 'qualquer', ean: '789', feito: false }], 'Outro nome', '789')[0].feito).toBe(true)
  })
  it('não mexe em item já marcado nem marca o que não bate', () => {
    const l = [{ nome: 'leite', feito: true }, { nome: 'ovos', feito: false }]
    expect(marcarLista(l, 'Arroz', '1')).toEqual(l)
  })
  it('item vazio na lista nunca marca', () => {
    expect(marcarLista(lista('   '), 'Arroz', '1')[0].feito).toBe(false)
  })
})
