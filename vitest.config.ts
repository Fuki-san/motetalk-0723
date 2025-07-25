import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // 高速化設定
    pool: 'forks', // 並列実行
    poolOptions: {
      forks: {
        singleFork: true, // 単一フォークで高速化
      },
    },
    // ファイル監視の最適化
    watch: false, // デフォルトで監視無効
    // テストタイムアウト
    testTimeout: 10000,
    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
}); 