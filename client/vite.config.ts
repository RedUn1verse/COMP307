import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    allowedHosts: [
      "winter2026-comp307-group09.cs.mcgill.ca"
    ],
    proxy: {
      '/auth': 'http://127.0.0.1:3000',
      '/bookings': 'http://127.0.0.1:3000',
      '/users': 'http://127.0.0.1:3000',
      '/api': 'http://127.0.0.1:3000'
    }
  }
})
