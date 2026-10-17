import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      // Duas páginas: a landing page (/), com login, e o app (/app/), que exige sessão.
      input: { landing: 'index.html', app: 'app/index.html' },
      output: {
        // SDK do Firebase muda pouco: em chunk separado fica em cache entre deploys.
        // O login fica separado do Firestore: a landing page baixa só ele, e sob demanda.
        manualChunks: {
          'firebase-auth': ['firebase/app', 'firebase/auth'],
          firestore: ['firebase/firestore'],
          react: ['react', 'react-dom', 'react-dom/client'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Flashcards',
        short_name: 'Flashcards',
        description: 'Flashcards com revisão espaçada para memorização.',
        lang: 'pt-BR',
        start_url: '/app/',
        scope: '/app/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#4f46e5',
        background_color: '#f6f7fb',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Só as rotas do app caem no fallback do SPA; a landing (/) e o Firebase Auth (/__/) ficam de fora.
        navigateFallback: 'app/index.html',
        navigateFallbackAllowlist: [/^\/app(\/|$)/],
      },
    }),
  ],
})
