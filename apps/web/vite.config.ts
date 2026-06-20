/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Dev proxy target for the API. Defaults to the local CEF dev server; override
// with VM_PROXY_TARGET when the API runs elsewhere.
const proxyTarget = process.env.VM_PROXY_TARGET ?? 'http://localhost:8888'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Same-origin `/api` keeps the browser CORS-free; strip the prefix so the
      // API receives its root-relative paths (e.g. `/api/auth/login` -> `/auth/login`).
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
  },
})
