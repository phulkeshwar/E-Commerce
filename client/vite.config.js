import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendUrl = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001'

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    proxy: {
      '/api': backendUrl,
    },
  },
})

