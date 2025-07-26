// プッシュ通知サービス
export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Service Workerを登録
  async registerServiceWorker(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', this.registration);
        return true;
      } else {
        console.warn('❌ Service Worker not supported');
        return false;
      }
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  // プッシュ通知の許可を要求
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('❌ Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('📱 Notification permission:', permission);
    return permission;
  }

  // プッシュ通知の購読
  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        console.error('❌ Service Worker not registered');
        return null;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('❌ Notification permission denied');
        return null;
      }

      // VAPIDキーを取得（実際の実装ではサーバーから取得）
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // 実際のVAPIDキーに置き換え
      
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('✅ Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      return null;
    }
  }

  // プッシュ通知の購読解除
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Push unsubscription failed:', error);
      return false;
    }
  }

  // 購読状態を確認
  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('❌ Subscription check failed:', error);
      return false;
    }
  }

  // VAPIDキーをUint8Arrayに変換
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // テスト通知を送信
  async sendTestNotification(): Promise<void> {
    if (!this.registration) {
      console.error('❌ Service Worker not registered');
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('❌ Notification permission denied');
      return;
    }

    await this.registration.showNotification('MoteTalk', {
      body: 'これはテスト通知です',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: '/',
        title: 'MoteTalk'
      }
    });
  }
}

// シングルトンインスタンスをエクスポート
export const pushNotificationService = PushNotificationService.getInstance(); 