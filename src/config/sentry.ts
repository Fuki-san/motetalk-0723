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

    try {
      Sentry.init({
        dsn: dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1, // 10%のリクエストをトレース
        // BrowserTracingは削除（エラーの原因）
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
    } catch (error) {
      console.error('❌ Sentry初期化エラー:', error);
    }
  }
};

// エラー境界コンポーネント
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// パフォーマンス監視（削除 - インポートエラーの原因）
// export const startTransaction = (name: string, operation: string) => {
//   if (process.env.NODE_ENV === 'production') {
//     try {
//       return Sentry.startTransaction({
//         name,
//         op: operation,
//       });
//     } catch (error) {
//       console.warn('Sentry transaction error:', error);
//       return null;
//     }
//   }
//   return null;
// }; 