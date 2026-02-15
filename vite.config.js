import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      pocketbase: resolve(__dirname, 'node_modules/pocketbase/dist/pocketbase.es.mjs')
    }
  },
  base: './',
  build: {
    // Ensure assets are properly referenced for Capacitor
    assetsDir: 'assets',
    sourcemap: false,
    // Minify for production builds
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Ensure consistent chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Manual chunk splitting for better performance
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'utils-vendor': ['boring-avatars', 'qrcode.react', 'react-qr-code'],
          'docx': ['docx']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['all', 'tnw7e12g1a-5174.cnb.run', 'tnw7e12g1a-4002.cnb.run'],
    proxy: {
      '/api/api': {
        target: 'http://127.0.0.1:4002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/api/, '/api')
      },
      '/api': {
        target: 'http://127.0.0.1:4002',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});
