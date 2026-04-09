import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    host: true,
    strictPort: true,
    // Proxy /api to Vercel dev server (vercel dev runs on :3000)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // keep /api prefix
      }
    }
  }
})
