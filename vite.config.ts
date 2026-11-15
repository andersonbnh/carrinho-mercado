import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Carrinho do Mercado',
        short_name: 'Carrinho',
        start_url: '.',
        display: 'standalone',
        background_color: '#f6f5ef',
        theme_color: '#0f5132',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
})
