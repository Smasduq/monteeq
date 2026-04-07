import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/v1/': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true
        },
        '/api/rust/': {
          target: env.VITE_RUST_API_URL || 'http://localhost:8081',
          changeOrigin: true
        }
      }
    }
  }
})
