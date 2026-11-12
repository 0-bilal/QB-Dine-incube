/* رقم إصدار المنيو — غيّره عند كل تحديث للموقع حتى تُحدَّث الملفات المخزنة على الأجهزة.
   يُستخدم في الصفحات وفي Service Worker (لذلك نستخدم self بدل window). */
self.INCUBE_VERSION = "1.1.0";

/* ملفات التطبيق التي تُخزَّن للعمل بدون إنترنت */
self.INCUBE_SHELL = [
  "./", "index.html", "admin.html",
  "css/menu.css", "css/admin.css",
  "js/version.js", "js/defaults.js", "js/store.js", "js/pwa.js", "js/menu.js", "js/admin.js",
  "manifest.webmanifest", "admin.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png",
  "icons/icon-admin-192.png", "icons/icon-admin-512.png", "icons/maskable-admin-512.png", "icons/apple-touch-icon-admin.png",
  "Assets/photo_1_2026-11-12_17-42-36.jpg", "Assets/photo_2_2026-11-12_17-42-36.jpg",
  "Assets/photo_3_2026-11-12_17-42-36.jpg", "Assets/photo_4_2026-11-12_17-42-36.jpg",
  "Assets/photo_5_2026-11-12_17-42-36.jpg"
];
