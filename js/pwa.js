/* INCUBE — تشغيل التطبيق كـ PWA + أدوات مشتركة بين الصفحات */
(function () {
  const PWA = {};
  const hadController = "serviceWorker" in navigator && !!navigator.serviceWorker.controller;

  /* تسجيل Service Worker وفحص التحديثات كل 30 دقيقة (الشاشة قد تبقى مفتوحة أياماً) */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then(reg => {
        setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
      }).catch(() => {});
    });
    // عند تثبيت إصدار جديد: نعيد تحميل الصفحة مرة واحدة لتعمل بالملفات الجديدة
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });
  }

  /* إعادة تحميل كاملة: مسح الكاش وإعادة جلب كل الملفات من الخادم.
     لا تمسح بيانات المنيو المحفوظة (الأصناف والأسعار والإعلانات). */
  PWA.hardReload = async function () {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch (e) {}
    try {
      if ("caches" in self) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch (e) {}
    // تحديث نسخ المتصفح من الملفات (HTTP cache) قبل إعادة التحميل
    try {
      await Promise.race([
        Promise.all((self.INCUBE_SHELL || []).map(u => fetch(u, { cache: "reload" }).catch(() => {}))),
        new Promise(r => setTimeout(r, 8000))
      ]);
    } catch (e) {}
    location.replace(location.pathname + "?r=" + Date.now());
  };

  /* عدّاد الضغطات المتتالية: ينفّذ الإجراء حسب عدد الضغطات بعد توقف قصير.
     onTap(count) يُستدعى مع كل ضغطة لإظهار إشارة للمستخدم. */
  PWA.taps = function (el, actions, onTap, gap = 650) {
    let n = 0, t;
    el.addEventListener("click", e => {
      e.stopPropagation();
      n++;
      if (onTap) onTap(n);
      clearTimeout(t);
      const max = Math.max.apply(null, Object.keys(actions).map(Number));
      if (n >= max) { const c = n; n = 0; actions[c] && actions[c](); return; }
      t = setTimeout(() => { const c = n; n = 0; actions[c] && actions[c](); }, gap);
    });
  };

  // عرض رقم الإصدار بالأرقام العربية أو الإنجليزية
  PWA.version = (lang) => {
    const v = self.INCUBE_VERSION || "";
    return lang === "ar" ? v.replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]) : v;
  };

  window.PWA = PWA;
})();
