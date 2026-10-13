import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      // Duas páginas: o app (/) e a landing page (/sobre), que não carrega o Firebase.
      input: { app: 'index.html', sobre: 'sobre/index.html' },
      output: {
        // SDK do Firebase muda pouco: em chunk separado fica em cache entre deploys.
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
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
        start_url: '/',
        scope: '/',
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
        // Rotas internas do Firebase Auth e a landing page não devem cair no fallback do SPA.
        navigateFallbackDenylist: [/^\/__\//, /^\/sobre/],
      },
    }),
  ],
})
