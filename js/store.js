/* تخزين محلي في المتصفح — بدون قاعدة بيانات. */
(function () {
  const KEY = "incube-menu-v1";
  const clone = o => JSON.parse(JSON.stringify(o));

  // يكمل أي حقول ناقصة من القيم الافتراضية (مفيد بعد تحديث الموقع أو رفع نسخة قديمة)
  function migrate(d) {
    const def = clone(window.INCUBE_DEFAULTS);
    if (!d || typeof d !== "object") return def;
    const out = Object.assign({}, def, d);
    out.settings = Object.assign({}, def.settings, d.settings);
    out.promoPanel = Object.assign({}, def.promoPanel, d.promoPanel);
    out.texts = {
      ar: Object.assign({}, def.texts.ar, d.texts && d.texts.ar),
      en: Object.assign({}, def.texts.en, d.texts && d.texts.en)
    };
    if (!Array.isArray(out.categories)) out.categories = def.categories;
    if (!Array.isArray(out.ads)) out.ads = def.ads;
    out.categories.forEach(c => { if (!Array.isArray(c.items)) c.items = []; });
    return out;
  }

  function isValid(d) {
    return d && typeof d === "object" && Array.isArray(d.categories) &&
      d.categories.every(c => c && Array.isArray(c.items));
  }

  const Store = {
    KEY,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return migrate(JSON.parse(raw));
      } catch (e) { /* تخزين غير متاح أو بيانات تالفة */ }
      return clone(window.INCUBE_DEFAULTS);
    },
    save(d) { localStorage.setItem(KEY, JSON.stringify(d)); },   // يرمي خطأ عند امتلاء المساحة
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} },
    size() { try { return (localStorage.getItem(KEY) || "").length; } catch (e) { return 0; } },
    migrate, isValid, clone,
    onChange(cb) {
      addEventListener("storage", e => { if (e.key === KEY || e.key === null) cb(Store.load()); });
    }
  };
  window.Store = Store;
})();
