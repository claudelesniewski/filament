import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/vendors': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/filaments': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/purchases': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/purchase-items': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/spools': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/inventory': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/openapi.json': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
