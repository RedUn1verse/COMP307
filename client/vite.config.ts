import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    hmr: false,
    watch: null,

    allowedHosts: [
      'winter2026-comp307-group09.cs.mcgill.ca'
    ],
    
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/user': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/booking': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/slot': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/proposal': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/meeting': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  }
})
