import { describe, it, expect, vi, beforeEach } from 'vitest'

// Função simples (não vi.fn): no Vitest 5 rejeições dentro de vi.fn são reportadas mesmo quando tratadas.
type Req = { model: string; contents: { parts: { inlineData?: unknown }[] }[]; config: { responseMimeType: string } }
let impl: (r: Req) => Promise<{ text?: string }> = async () => ({})
const calls: Req[] = []
const generateContent = (r: Req) => { calls.push(r); return impl(r) }

vi.mock('@google/genai', () => {
  class ApiError extends Error {
    status: number
    constructor(o: { message: string; status: number }) { super(o.message); this.status = o.status }
  }
  return { ApiError, ThinkingLevel: { MINIMAL: 'MINIMAL' }, GoogleGenAI: class { models = { generateContent } } }
})

const { readLabel, MODELO } = await import('./readLabel')
const { ApiError } = (await import('@google/genai')) as unknown as { ApiError: new (o: { message: string; status: number }) => Error }

const ok = { nome: 'Arroz 5kg', preco_unitario: 27.9, preco_atacado: 25.49, qtd_atacado: 3, ean: null }
const msg = (p: Promise<unknown>) => p.then(() => 'sem erro', (e: Error) => e.message)

describe('readLabel (Gemini)', () => {
  beforeEach(() => { calls.length = 0 })

  it('envia imagem + schema e devolve etiqueta validada', async () => {
    impl = async () => ({ text: JSON.stringify(ok) })
    expect(await readLabel('BASE64', 'k')).toEqual(ok)
    expect(calls[0].model).toBe(MODELO)
    expect(calls[0].contents[0].parts[0].inlineData).toEqual({ mimeType: 'image/jpeg', data: 'BASE64' })
    expect(calls[0].config.responseMimeType).toBe('application/json')
  })
  it('usa modelo rápido com raciocínio mínimo (resposta lenta estourava 45 s)', async () => {
    impl = async () => ({ text: JSON.stringify(ok) })
    await readLabel('BASE64', 'k')
    expect(calls[0].model).toBe('gemini-3.5-flash-lite')
    expect((calls[0].config as unknown as { thinkingConfig: unknown }).thinkingConfig).toEqual({ thinkingLevel: 'MINIMAL' })
  })
  it('JSON fora do formato → erro amigável', async () => {
    impl = async () => ({ text: '{"nome": 1}' })
    expect(await msg(readLabel('x', 'k'))).toContain('Não entendi a etiqueta')
  })
  it('resposta vazia → erro amigável', async () => {
    impl = async () => ({ text: undefined })
    expect(await msg(readLabel('x', 'k'))).toContain('não conseguiu ler')
  })
  it('chave inválida (400 API key) → mensagem de chave', async () => {
    impl = async () => { throw new ApiError({ message: 'API key not valid', status: 400 }) }
    expect(await msg(readLabel('x', 'k'))).toContain('Chave da API inválida')
  })
  it('429 → limite gratuito', async () => {
    impl = async () => { throw new ApiError({ message: 'quota', status: 429 }) }
    expect(await msg(readLabel('x', 'k'))).toContain('Limite gratuito')
  })
  it('falha de rede → sem internet', async () => {
    impl = async () => { throw new TypeError('Failed to fetch') }
    expect(await msg(readLabel('x', 'k'))).toContain('Sem internet')
  })
})
