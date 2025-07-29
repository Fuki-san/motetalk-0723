// Google Analytics 4 Configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics 4 の初期化
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('⚠️ VITE_GA_MEASUREMENT_IDが設定されていません。Google Analyticsが無効です。');
    return;
  }

  // Google Analytics スクリプトを動的に追加
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);

  console.log('✅ Google Analytics 4 を初期化しました:', measurementId);
};

// ページビューのトラッキング
export const trackPageView = (pageTitle: string, pagePath?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_title: pageTitle,
      page_location: pagePath || window.location.href
    });
    console.log('📊 ページビューをトラッキング:', pageTitle);
  }
};

// イベントトラッキング
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
    console.log('📊 イベントをトラッキング:', eventName, parameters);
  }
};

// 購入イベントのトラッキング
export const trackPurchase = (value: number, currency: string, itemName: string) => {
  trackEvent('purchase', {
    value: value,
    currency: currency,
    items: [{ item_name: itemName }]
  });
};

// サブスクリプション開始イベントのトラッキング
export const trackSubscriptionStart = (value: number, currency: string) => {
  trackEvent('subscription_start', {
    value: value,
    currency: currency
  });
};

// サブスクリプション解約イベントのトラッキング
export const trackSubscriptionCancel = () => {
  trackEvent('subscription_cancel');
};

// AI返信生成イベントのトラッキング
export const trackAIGeneration = () => {
  trackEvent('ai_reply_generation');
};

// 背景状況設定変更イベントのトラッキング
export const trackBackgroundContextChange = () => {
  trackEvent('background_context_change');
}; 