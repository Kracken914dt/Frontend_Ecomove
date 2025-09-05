import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        //target: 'https://ecomove-v1.onrender.com',
        //target: 'http://localhost:8080',
        target:'https://ecomove.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
