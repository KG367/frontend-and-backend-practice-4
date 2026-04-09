const CACHE_NAME = 'notes-cache-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/sw.js',
  '/icons/add_notes_16dp_E3E3E3_FILL0_wght400_GRAD0_opsz20.png',
  '/icons/add_notes_32dp_E3E3E3_FILL0_wght400_GRAD0_opsz40.png',
  '/icons/add_notes_48dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
  '/icons/add_notes_64dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
  '/icons/add_notes_128dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
  '/icons/add_notes_256dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
  '/icons/add_notes_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
];

const CONTENT = [
  '/content/home.html',
  '/content/about.html'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS) && cache.addAll(CONTENT))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Для статики – Cache First, для контента – Network First
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Пропускаем запросы к другим источникам (например, к CDN chota)
  if (url.origin !== location.origin) return;

  // Динамические страницы (content/*) – сначала сеть, затем кэш
  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          // Кэшируем свежий ответ
          const resClone = networkRes.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
          return networkRes;
        })

        .catch(() => {
          // Если сеть недоступна, берём из кэша (или home как fallback)
          return caches.match(event.request)
            .then(cached => cached || caches.match('/content/home.html'));
        })
    );
  }
  else
    event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(request);

    if (request.method === 'GET' && !request.url.startsWith("/socket.io/")) {
      const clone = res.clone()
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, clone);
      });
    }

    return res;
  } catch {
    return new Response('Офлайн: ресурс недоступен и не найден в кеше.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

self.addEventListener('push', (event) => {
  let data = { title: 'Новое уведомление', body: '', reminderId: null };
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    body: data.body,
    icon: '/icons/add_notes_128dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
    badge: '/icons/add_notes_48dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.png',
    data: { reminderId: data.reminderId } // для идентификации в click
  };
  // Добавляем кнопку только если это напоминание
  if (data.reminderId) {
    options.actions = [
      { action: 'snooze', title: 'Отложить на 5 минут' }
    ];
  }
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  if (action === 'snooze') {
    // Получаем id напоминания из данных уведомления
    const reminderId = notification.data.reminderId;
    // Отправляем запрос на сервер для откладывания
    event.waitUntil(
      fetch(`/snooze?reminderId=${reminderId}`, { method: 'POST' })
        .then(() => notification.close())
        .catch(err => console.error('Snooze failed:', err))
    );
  } else {
    // При клике на само уведомление просто закрываем его
    notification.close();
  }
});