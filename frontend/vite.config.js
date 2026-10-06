import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:5001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: apiTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
