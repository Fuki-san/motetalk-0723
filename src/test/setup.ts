// テスト環境のセットアップ
import '@testing-library/jest-dom';

// 必要最小限のモックのみ
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// fetchのモック（必要時のみ）
if (!global.fetch) {
  global.fetch = vi.fn();
}

// localStorageのモック（必要時のみ）
if (!global.localStorage) {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock;
} 