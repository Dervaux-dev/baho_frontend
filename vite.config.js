import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxies /api requests to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Proxies /n8n requests to the n8n cloud instance (avoids CORS in dev)
      '/n8n': {
        target: 'https://dervaux.app.n8n.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/n8n/, ''),
      },
    },
  },
})
