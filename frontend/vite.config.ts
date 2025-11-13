import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const __dirname = path.resolve();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Allow specific external hosts (e.g., ngrok tunnels) to access the dev server
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'd9783a22362a.ngrok-free.app',
      '05sf7791-5173.euw.devtunnels.ms'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
