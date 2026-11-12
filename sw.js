/* INCUBE — Service Worker
   يعرض الملفات من التخزين فوراً (يعمل بدون إنترنت) ويحدّثها في الخلفية.
   عند تغيير رقم الإصدار في js/version.js يُحذف التخزين القديم ويُحمَّل الجديد. */
importScripts("js/version.js");
const CACHE = "incube-" + self.INCUBE_VERSION;
const FONTS = "incube-fonts";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(self.INCUBE_SHELL.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function staleWhileRevalidate(req, cacheName, key) {
  return caches.open(cacheName).then(cache =>
    cache.match(key || req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === "opaque")) cache.put(key || req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(staleWhileRevalidate(req, FONTS));
    return;
  }
  if (url.origin !== location.origin) return;

  // نتجاهل أي معاملات في الرابط (مثل ?r=) حتى تُطابق الصفحة المخزنة
  const key = req.mode === "navigate" ? new Request(url.origin + url.pathname) : undefined;
  e.respondWith(
    staleWhileRevalidate(req, CACHE, key).then(res => res || caches.match("index.html"))
  );
});
