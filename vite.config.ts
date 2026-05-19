import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v3': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
