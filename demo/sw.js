// Service Worker：快取示範所需嘅靜態檔案，令拜山位置卡可以離線打開。
// 只承諾：已載入過一次之後，離線重開示範同位置卡。冇承諾外部連結可用。
const CACHE = 'faanukkei-demo-v1';
const ASSETS = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest', 'icon.svg', 'vendor/phaser.min.js',
  'js/main.js', 'js/bus.js', 'js/player.js',
  'js/scenes/BootScene.js', 'js/scenes/HomeScene.js',
  'js/world/layout.js', 'js/world/objects.js', 'js/world/art.js',
  'js/ui/panel.js', 'js/ui/views.js', 'js/ui/illustrations.js',
  'js/data/demo-data.js', 'js/data/store.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// 網絡優先（拎到最新），斷網就用快取
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
