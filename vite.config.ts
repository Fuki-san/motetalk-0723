import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // バンドルサイズ最適化
    rollupOptions: {
      output: {
        manualChunks: {
          // ベンダーライブラリを分離
          vendor: ['react', 'react-dom'],
          // UIライブラリを分離
          ui: ['lucide-react'],
          // 外部サービスを分離
          services: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
    // チャンクサイズ警告の閾値
    chunkSizeWarningLimit: 1000,
    // ソースマップ（本番環境では無効）
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  // 開発サーバー設定
  server: {
    port: 3001,
    host: true,
  },
  // 依存関係の最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});
