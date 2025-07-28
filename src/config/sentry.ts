import * as Sentry from "@sentry/react";

// Sentry初期化
export const initSentry = () => {
  // 本番環境でのみSentryを有効化
  if (import.meta.env.PROD) {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!dsn) {
      console.warn('⚠️ VITE_SENTRY_DSNが設定されていません。Sentry監視が無効です。');
      return;
    }

    Sentry.init({
      dsn: dsn,
      environment: import.meta.env.MODE,
      // エラーの前処理
      beforeSend(event) {
        // 機密情報を除外
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
        }
        return event;
      },
    });
    
    // 本番環境でのみログを出力
    console.log('✅ Sentry監視が有効になりました');
  }
};

// エラー境界コンポーネント
export const SentryErrorBoundary = Sentry.ErrorBoundary; 