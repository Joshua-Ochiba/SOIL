import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  logLevel: 'error',
  plugins: [react()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    // Raise the warning threshold slightly — we're intentionally splitting
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Three.js + react-three — only used on the home page
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          // Framer Motion — used across pages but worth isolating for caching
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          // Supabase — studio + admin only
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // React Query
          if (id.includes('@tanstack')) {
            return 'vendor-query';
          }
          // React core — keep together with router for fast initial parse
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('scheduler')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },

  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
