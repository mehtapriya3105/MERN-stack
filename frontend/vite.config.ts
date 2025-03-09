import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',// this willl avoid the whole path to be prefixed with '/api'
        changeOrigin: true,
        
      } 
  }
},
  plugins: [react(),
    tailwindcss(),
  ],
})
