import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/api/rust/': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
