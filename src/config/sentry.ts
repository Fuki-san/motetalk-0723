import * as Sentry from "@sentry/react";

// Sentry初期化
export const initSentry = () => {
  // 本番環境でのみSentryを有効化
  if (process.env.NODE_ENV === 'production') {
    const dsn = process.env.VITE_SENTRY_DSN;
    
    if (!dsn) {
      console.warn('⚠️ VITE_SENTRY_DSNが設定されていません。Sentry監視が無効です。');
      return;
    }

    Sentry.init({
      dsn: dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10%のリクエストをトレース
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ["localhost", "motetalk.com"],
        }),
      ],
      // エラーの前処理
      beforeSend(event) {
        // 機密情報を除外
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
        }
        return event;
      },
    });
    
    console.log('✅ Sentry監視が有効になりました');
  }
};

// エラー境界コンポーネント
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// パフォーマンス監視
export const startTransaction = (name: string, operation: string) => {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.startTransaction({
      name,
      op: operation,
    });
  }
  return null;
}; 