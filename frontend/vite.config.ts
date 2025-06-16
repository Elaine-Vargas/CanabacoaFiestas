import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // Elimina todos los console.*
        drop_debugger: true,     // Elimina los debugger
        pure_funcs: ['console.info', 'console.debug', 'console.warn'], // Elimina estos métodos específicos
        passes: 2,               // Más pasadas de compresión
      },
      mangle: true,              // Renombra variables para menor tamaño
      format: {
        comments: false,         // Elimina todos los comentarios
      },
    },
  },
})
