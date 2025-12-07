import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Backend API proxy (primary)
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Legacy: Stays.net direct API (deprecated)
      '/stays-api': {
        target: 'https://casap.stays.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stays-api/, ''),
        secure: true,
      },
    },
  },
})
