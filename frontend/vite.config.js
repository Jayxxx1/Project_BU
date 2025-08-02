// File: frontend/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // โหลดตัวแปรจาก .env(.development/.production) มาใส่ใน env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, '/api'),
          logLevel: 'debug'
        },
      },
    },
    define: {
      'process.env': env,
    },
  };
});
