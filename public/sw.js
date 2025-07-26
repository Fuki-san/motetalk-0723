// Service Worker for Push Notifications
const CACHE_NAME = 'motetalk-v1';

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll([
          '/',
          '/index.html',
          '/static/js/bundle.js',
          '/static/css/main.css'
        ]);
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// プッシュ通知の受信処理
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '新しいメッセージがあります',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        title: data.title || 'MoteTalk'
      },
      actions: [
        {
          action: 'open',
          title: '開く',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: '閉じる',
          icon: '/icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'MoteTalk', options)
    );
  }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// 通知を閉じた時の処理
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// フェッチイベントの処理（オフライン対応）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあった場合はそれを返す
        if (response) {
          return response;
        }
        
        // キャッシュになければネットワークから取得
        return fetch(event.request);
      }
    )
  );
}); 