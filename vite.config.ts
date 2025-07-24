import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
        // より安定したファイル名生成
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase'],
          stripe: ['@stripe/stripe-js'],
        },
      },
    },
    // ビルド設定の改善
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // より安定したビルド
    minify: 'terser',
    target: 'es2020',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
