import { GoogleGenAI, ApiError } from '@google/genai'
import { z } from 'zod'
import type { Etiqueta } from '../core/label'

export const MODELO = 'gemini-3.8-flash'

const EtiquetaSchema = z.object({
  nome: z.string(),
  preco_unitario: z.number().nullable(),
  preco_atacado: z.number().nullable(),
  qtd_atacado: z.number().int().nullable(),
  ean: z.string().nullable(),
})

const num = { type: ['number', 'null'] }
const JSON_SCHEMA = {
  type: 'object',
  properties: {
    nome: { type: 'string' },
    preco_unitario: num,
    preco_atacado: num,
    qtd_atacado: { type: ['integer', 'null'] },
    ean: { type: ['string', 'null'] },
  },
  required: ['nome', 'preco_unitario', 'preco_atacado', 'qtd_atacado', 'ean'],
}

const PROMPT = `Foto de uma etiqueta de preço de prateleira do Assaí Atacadista (Brasil). Extraia:
- nome: o produto como está escrito (marca, tipo, tamanho/peso).
- preco_unitario: preço de uma unidade no varejo, em reais.
- preco_atacado: preço por unidade ao levar a quantidade mínima do atacado (ex.: "a partir de 3 un."), ou null se a etiqueta não tiver.
- qtd_atacado: essa quantidade mínima, ou null.
- ean: os dígitos do código de barras, se legíveis; senão null.
Não confunda o preço de referência (por kg, litro ou 100 g) com o preço do produto.
Se a etiqueta não estiver legível, deixe os preços null e descreva o que conseguir no nome.`

/** Lê uma etiqueta de preço (JPEG em base64) com o Gemini. Lança Error com mensagem para o usuário. */
export async function readLabel(jpegBase64: string, apiKey: string): Promise<Etiqueta> {
  const ai = new GoogleGenAI({ apiKey })
  let texto: string | undefined
  try {
    const r = await ai.models.generateContent({
      model: MODELO,
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: jpegBase64 } }, { text: PROMPT }] }],
      config: { responseMimeType: 'application/json', responseJsonSchema: JSON_SCHEMA },
    })
    texto = r.text
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 400 && /api key/i.test(e.message)) throw new Error('Chave da API inválida. Confira em ⚙.')
      if (e.status === 401 || e.status === 403) throw new Error('Chave da API inválida ou sem permissão. Confira em ⚙.')
      if (e.status === 429) throw new Error('Limite gratuito atingido. Tente em instantes.')
      throw new Error(`Erro da IA (${e.status}). Tente de novo.`)
    }
    throw new Error('Sem internet para ler a etiqueta.')
  }
  if (!texto) throw new Error('A IA não conseguiu ler esta foto. Digite os dados.')
  try {
    return EtiquetaSchema.parse(JSON.parse(texto))
  } catch {
    throw new Error('Não entendi a etiqueta. Tente outra foto.')
  }
}
