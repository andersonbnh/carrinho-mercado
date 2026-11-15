# Carrinho do Mercado

PWA pessoal para somar o carrinho do Assaí em tempo real. Funciona offline; os dados ficam só no celular.

## Recursos
- Scan de código de barras (câmera) → nome automático (Open Food Facts) e, a partir da 2ª vez, preço da última compra.
- Preço de atacado (preço a partir de N unidades do mesmo produto) aplicado sozinho.
- Total grande, limite de gasto com barra verde/amarela/vermelha.
- Lista de compras marcada ao escanear; histórico; compartilhar resumo.
- Foto da etiqueta lida por IA (Google Gemini `gemini-3.8-flash`): nome, preço, atacado e código. Você confere antes de adicionar.

## Leitura de etiqueta (IA do Google)
1. Entre em https://aistudio.google.com com sua conta Google.
2. Clique em "Get API key" → crie a chave e cole no app em ⚙. Ela fica só no celular.
Cota gratuita: sem custo, com limite de uso; no plano gratuito o Google pode usar o conteúdo
(as fotos das etiquetas) para melhorar os produtos. Ativando cobrança na conta, isso deixa de ocorrer.

## Comandos
```bash
npm install
npm test        # testes da lógica (Vitest)
npm run dev     # desenvolvimento
npm run build   # gera dist/
```

## Usar no Android
A câmera só funciona em HTTPS. Publique a pasta `dist/` num host com HTTPS
(GitHub Pages, Netlify, Cloudflare Pages), abra no Chrome do celular e use
menu ⋮ → "Adicionar à tela inicial".

Docs: `docs/superpowers/specs/` (design) e `docs/superpowers/plans/` (plano).
