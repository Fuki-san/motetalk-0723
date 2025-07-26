// エラーハンドリング強化ユーティリティ

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

export class AppError extends Error {
  public code: string;
  public context: string;
  public timestamp: Date;

  constructor(message: string, code: string, context: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

export const errorHandler = {
  // エラー情報を収集
  collectErrorInfo(error: Error, context?: string): ErrorInfo {
    return {
      message: error.message,
      code: (error as AppError).code || 'UNKNOWN_ERROR',
      context: context || 'unknown',
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  },

  // エラーをログに記録
  logError(error: Error, context?: string) {
    const errorInfo = this.collectErrorInfo(error, context);
    console.error('🚨 エラーが発生しました:', errorInfo);
    
    // 本番環境では外部サービスに送信
    if (process.env.NODE_ENV === 'production') {
      // SentryやLogRocketに送信
      this.sendToMonitoringService(errorInfo);
    }
  },

  // 監視サービスに送信
  sendToMonitoringService(errorInfo: ErrorInfo) {
    // SentryやLogRocketの実装
    console.log('📊 監視サービスに送信:', errorInfo);
  },

  // ユーザーフレンドリーなエラーメッセージ
  getUserFriendlyMessage(error: Error): string {
    const errorCode = (error as AppError).code;
    
    switch (errorCode) {
      case 'PAYMENT_FAILED':
        return '決済処理中にエラーが発生しました。しばらく時間をおいて再度お試しください。';
      case 'NETWORK_ERROR':
        return 'ネットワーク接続に問題があります。インターネット接続をご確認ください。';
      case 'AUTHENTICATION_ERROR':
        return '認証に失敗しました。再度ログインしてください。';
      case 'TEMPLATE_NOT_FOUND':
        return 'テンプレートが見つかりませんでした。ページを再読み込みしてください。';
      default:
        return '予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。';
    }
  },

  // API呼び出しのエラーハンドリング
  async handleApiCall<T>(
    apiCall: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      this.logError(error as Error, context);
      throw new AppError(
        this.getUserFriendlyMessage(error as Error),
        (error as AppError).code || 'API_ERROR',
        context
      );
    }
  },
};

// グローバルエラーハンドラー
export const setupGlobalErrorHandler = () => {
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error, 'global');
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(new Error(event.reason), 'unhandled-promise');
  });
}; 