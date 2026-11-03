import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cloudflare (sst.andesnova.solutions) sirve en la raiz; GitHub Pages define VITE_BASE=/IPERC-Matriz/.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
})
