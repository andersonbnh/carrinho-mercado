import { describe, it, expect } from 'vitest'
import { readLabel } from './readLabel'

// Usa o SDK real do Google com uma "rede" simulada (fetch injetado), para reproduzir o travamento.
const msg = (p: Promise<unknown>) => p.then(() => 'sem erro', (e: Error) => e.message)
const resposta = (status: number, body: unknown) => async () =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
/** Servidor que nunca responde (só desiste quando o pedido é abortado). */
const servidorMudo = (async (_url: unknown, init?: RequestInit) =>
  new Promise((_, rej) => init?.signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))))) as typeof fetch

describe('readLabel com SDK real: nunca fica preso', () => {
  it('429 (cota) falha logo, sem novas tentativas silenciosas', async () => {
    let chamadas = 0
    const f = (async (...a: unknown[]) => { chamadas++; return resposta(429, { error: { code: 429, message: 'quota', status: 'RESOURCE_EXHAUSTED' } })() }) as typeof fetch
    const t0 = Date.now()
    expect(await msg(readLabel('eA==', 'k', { fetch: f }))).toContain('Limite')
    expect(chamadas).toBe(1)
    expect(Date.now() - t0).toBeLessThan(2000)
  })
  it('servidor que não responde → erro de tempo esgotado', async () => {
    expect(await msg(readLabel('eA==', 'k', { fetch: servidorMudo, timeoutMs: 300 }))).toContain('demorou')
  })
  it('usuário cancela → erro de cancelado', async () => {
    const ac = new AbortController()
    const p = msg(readLabel('eA==', 'k', { fetch: servidorMudo, signal: ac.signal }))
    setTimeout(() => ac.abort(), 50)
    expect(await p).toContain('Cancelado')
  })
})
