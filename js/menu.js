/* INCUBE — منطق شاشة المنيو */
(function () {
  const $ = id => document.getElementById(id);
  const AD = "٠١٢٣٤٥٦٧٨٩";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const br = s => esc(s).replace(/\n/g, "<br>");

  let D = Store.load();
  let lang = D.settings.defaultLang === "en" ? "en" : "ar";
  let cat = 0, slide = 0, selected = null;
  let cats = [], slides = [];
  let auto = false, idleT = null, catT = null, slideT = null, focusT = null;

  const num = (n, pad) => {
    let s = String(n == null ? "" : n);
    if (pad) s = s.padStart(pad, "0");
    return lang === "ar" ? s.replace(/\d/g, d => AD[d]) : s;
  };
  const T = () => D.texts[lang];
  const cur = () => (lang === "ar" ? D.settings.currencyAr : D.settings.currencyEn) || "";
  const L = {
    ar: { cols: ["الرقم", "الصنف", "السعرات", "السعر"], cal: "سعرة", auto: "تلقائي", manual: "يدوي", tap: "اضغط على الصنف المعلَّم لعرض صورته", other: "EN", empty: "لا توجد أصناف مفعّلة حالياً" },
    en: { cols: ["QTY", "ITEM", "CALORIES", "PRICE"], cal: "cal", auto: "AUTO", manual: "MANUAL", tap: "TAP A MARKED ITEM TO SEE ITS PHOTO", other: "عربي", empty: "NO ITEMS AVAILABLE" }
  };

  /* ---------- البيانات الظاهرة فقط ---------- */
  function compute() {
    cats = D.categories
      .filter(c => c.enabled !== false)
      .map(c => Object.assign({}, c, { items: c.items.filter(i => i.enabled !== false) }))
      .filter(c => c.items.length);
    slides = D.promoPanel.enabled ? D.ads.filter(a => a.enabled !== false && (a.type === "text" || a.src)) : [];
    if (cat >= cats.length) cat = 0;
    if (slide >= slides.length) slide = 0;
  }
  const panelOn = () => D.promoPanel.enabled && slides.length > 0;
  function findItem(ref) {
    if (!ref) return null;
    const [c, i] = String(ref).split(":");
    const C = cats.find(x => x.id === c);
    if (!C) return null;
    const idx = C.items.findIndex(x => x.id === i);
    return idx < 0 ? null : { cat: C, item: C.items[idx], idx };
  }

  /* ---------- ملاءمة الشاشة ---------- */
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1200);
    $("stage").style.transform = `scale(${s})`;
  }
  addEventListener("resize", fit);

  /* ---------- المنيو ---------- */
  function renderTabs() {
    $("tabs").innerHTML = cats.map((c, i) => `<button class="tab ${i === cat ? "on" : ""}" data-i="${i}" type="button">
      <span class="c">#${String(c.items.length).padStart(3, "0")}</span>
      <span class="l">${esc(lang === "ar" ? c.ar : (c.short || c.en))}</span><span class="bar"></span></button>`).join("");
    $("tabs").querySelectorAll(".tab").forEach(b => b.onclick = () => { userTouch(); setCat(+b.dataset.i); });
    restartBar();
  }

  function renderSheet() {
    const t = T(), l = L[lang], c = cats[cat];
    const sheet = $("sheet");
    if (!c) { sheet.innerHTML = `<div class="empty">${l.empty}</div>`; return; }
    const showPh = panelOn();
    const hasStar = c.items.some(x => x.signature);
    const hasPh = showPh && c.items.some(x => x.image);
    const rows = c.items.map((x, i) => {
      const nm = lang === "ar" ? num(x.ar) : x.en;
      const sub = lang === "ar" ? x.subAr : x.subEn;
      const ph = showPh && x.image ? "ph" : "";
      const sel = selected === x.id ? "sel" : "";
      return `<div class="row ${ph} ${sel}" data-i="${i}" ${ph ? 'tabindex="0" role="button"' : ""}>
        <span class="q">${lang === "ar" ? num(i + 1) + "." : num(i + 1, 2)}</span>
        <span class="nm">${esc(nm)}${x.signature ? "<sup>★</sup>" : ""}${sub ? `<small>${esc(sub)}</small>` : ""}</span>
        <span class="cal">${x.cal === "" || x.cal == null ? "" : num(x.cal) + " " + l.cal}</span>
        <span class="pr">${num(x.price)}</span></div>`;
    }).join("");
    const cols = `<div class="cols"><span>${l.cols[0]}</span><span>${l.cols[1]}</span><span class="cal">${l.cols[2]}</span><span>${l.cols[3]} · ${esc(cur())}</span></div>`;
    sheet.innerHTML = `<div class="inner fade">
      <div class="sec"><span class="code" dir="ltr">#${num(c.items.length, 3)}</span><span>${esc(lang === "ar" ? c.ar : c.en)}</span></div>
      <hr class="dash">
      <div class="colsWrap">${cols}${cols}</div>
      <hr class="dash">
      <div class="rows">${rows}</div>
      ${hasPh ? `<div class="hint">▢ ${l.tap}</div>` : ""}
      <div class="fill"></div>
      ${hasStar ? `<div class="legend">★ ${esc(t.signature)}</div>` : ""}
      <hr class="dash">
      <div class="foot"><span class="note">${br(t.note)}</span>
        <span>${br(t.tagline)}<span class="pl">${br(t.place)}<br><span dir="ltr">${esc(t.handle)}</span></span></span>
        <span class="ty">${esc(t.thanks)}</span></div>
    </div>`;
    sheet.querySelectorAll(".row.ph").forEach(r => {
      const go = () => {
        userTouch();
        const item = c.items[+r.dataset.i];
        selected = item.id;
        showFocus(item.image);
        sheet.querySelectorAll(".row").forEach(x => x.classList.toggle("sel", x === r));
      };
      r.onclick = go;
      r.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
    fitRows();
  }

  // إن زادت الأصناف عن المساحة: نضغط المسافات ثم نوزعها على عمودين
  function fitRows() {
    const m = $("menu"), sheet = $("sheet");
    m.classList.remove("dense", "twocol");
    const over = () => sheet.firstElementChild && sheet.firstElementChild.scrollHeight > sheet.clientHeight + 1;
    if (!over()) return;
    m.classList.add("dense");
    if (!over()) return;
    m.classList.remove("dense"); m.classList.add("twocol");
    if (!over()) return;
    m.classList.add("dense");
  }

  function renderMenu() {
    const m = $("menu");
    m.dir = lang === "ar" ? "rtl" : "ltr";
    m.lang = lang;
    m.classList.toggle("nocal", !D.settings.showCalories);
    $("title").textContent = T().title;
    $("lang").textContent = L[lang].other;
    renderTabs(); renderSheet(); renderAuto();
  }
  function setCat(i) { cat = i; renderTabs(); renderSheet(); }
  $("lang").onclick = () => { userTouch(); lang = lang === "ar" ? "en" : "ar"; renderMenu(); renderCard(); };

  /* ---------- الإعلانات ---------- */
  function buildSlides() {
    const p = D.promoPanel;
    $("stage").classList.toggle("solo", !panelOn());
    $("wordmark").textContent = p.brand || "";
    $("wordmark").hidden = !p.showBrand || !p.brand;
    $("slides").innerHTML = slides.map((s, i) => {
      if (s.type === "text") {
        const hasBottom = s.footer || s.price;
        return `<div class="slide" data-i="${i}"><div class="promo" style="background:${esc(s.bg || "#5B3A24")};color:${esc(s.fg || "#F4EBE2")}">
          <div class="eyebrow">${esc(s.eyebrow)}</div>
          <div>${s.title ? `<h2>${br(s.title)}</h2>` : ""}${s.subtitle ? `<div class="sub">${br(s.subtitle)}</div>` : ""}${s.titleAr ? `<div class="ar-t">${br(s.titleAr)}</div>` : ""}</div>
          <div class="bottom ${hasBottom ? "" : "empty"}"><span>${br(s.footer)}</span>${s.price ? `<span class="price">${esc(s.price)}<small>${esc(s.priceUnit)}</small></span>` : ""}</div>
        </div></div>`;
      }
      return `<div class="slide ${s.fit === "contain" ? "contain" : ""}" data-i="${i}"><img src="${esc(s.src)}" alt=""></div>`;
    }).join("");
    $("dots").innerHTML = slides.length > 1 ? slides.map(() => "<i></i>").join("") : "";
    $("dots").hidden = !p.showDots;
  }

  function renderCard() {
    const s = slides[slide], card = $("card");
    const hit = s && s.type === "image" && D.promoPanel.showCard && $("focus").hidden ? findItem(s.link) : null;
    card.hidden = !hit;
    if (hit) {
      const x = hit.item, ar = lang === "ar";
      card.innerHTML = `<div class="k"><span>${esc(ar ? hit.cat.ar : hit.cat.en)}</span><span>${num(hit.idx + 1, 2)}</span></div>
        <div class="n ${ar ? "ar" : ""}">${esc(ar ? num(x.ar) : x.en)}</div>
        <div class="p ${ar ? "ar" : ""}"><span>${D.settings.showCalories && x.cal !== "" && x.cal != null ? num(x.cal) + " " + L[lang].cal : ""}</span><span>${num(x.price)} ${esc(cur())}</span></div>`;
    }
    document.querySelectorAll("#dots i").forEach((d, i) => d.classList.toggle("on", i === slide));
  }

  function show(i) {
    if (!slides.length) return;
    slide = (i + slides.length) % slides.length;
    document.querySelectorAll(".slide").forEach(el => {
      const on = +el.dataset.i === slide;
      el.classList.toggle("on", on);
      const img = el.querySelector("img");
      if (img && on) { img.style.animation = "none"; void img.offsetWidth; img.style.animation = ""; }
    });
    renderCard();
  }
  function restartSlides() {
    clearInterval(slideT);
    const ms = Math.max(2, +D.promoPanel.slideSeconds || 7) * 1000;
    if (slides.length > 1) slideT = setInterval(() => show(slide + 1), ms);
  }
  function showFocus(src) {
    const f = $("focus");
    f.querySelector("img").src = src;
    f.hidden = false;
    renderCard();
    clearInterval(slideT); clearTimeout(focusT);
    focusT = setTimeout(hideFocus, 12000);
  }
  function hideFocus() {
    clearTimeout(focusT);
    if ($("focus").hidden) return;
    $("focus").hidden = true;
    selected = null;
    document.querySelectorAll(".row.sel").forEach(x => x.classList.remove("sel"));
    renderCard(); restartSlides();
  }
  $("media").onclick = () => {
    userTouch();
    if (!$("focus").hidden) { hideFocus(); return; }
    show(slide + 1); restartSlides();
  };

  /* ---------- الوضع التلقائي ---------- */
  function renderAuto() {
    $("auto").hidden = !D.settings.autoMode;
    $("auto").classList.toggle("live", auto);
    $("autoTxt").textContent = auto ? L[lang].auto : L[lang].manual;
  }
  function restartBar() {
    const b = document.querySelector(".tab.on .bar");
    if (!b) return;
    b.classList.remove("run");
    if (auto) { b.style.setProperty("--dur", catMs() + "ms"); void b.offsetWidth; b.classList.add("run"); }
  }
  const catMs = () => Math.max(3, +D.settings.categorySeconds || 12) * 1000;
  function startAuto() {
    clearInterval(catT);
    auto = !!D.settings.autoMode;
    if (auto) {
      selected = null;
      catT = setInterval(() => { if (cats.length) setCat((cat + 1) % cats.length); }, catMs());
    }
    renderAuto(); restartBar();
  }
  function userTouch() {
    auto = false; clearInterval(catT); renderAuto(); restartBar();
    clearTimeout(idleT);
    if (!D.settings.autoMode) return;
    idleT = setTimeout(() => {
      const def = D.settings.defaultLang === "en" ? "en" : "ar";
      hideFocus();
      if (lang !== def) { lang = def; renderMenu(); renderCard(); }
      startAuto();
    }, Math.max(5, +D.settings.idleSeconds || 30) * 1000);
  }

  /* ---------- دخول لوحة التحكم: ضغط مطوّل 3 ثوانٍ على الشعار أو العنوان ---------- */
  function longPress(el) {
    let t;
    el.addEventListener("pointerdown", () => { t = setTimeout(() => { location.href = "admin.html"; }, 3000); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => el.addEventListener(ev, () => clearTimeout(t)));
  }
  longPress($("wordmark")); longPress($("title"));
  document.addEventListener("contextmenu", e => e.preventDefault());

  /* ---------- إبقاء الشاشة مضاءة إن أمكن ---------- */
  async function wake() { try { if (navigator.wakeLock && document.visibilityState === "visible") await navigator.wakeLock.request("screen"); } catch (e) {} }
  document.addEventListener("visibilitychange", wake);

  /* ---------- تشغيل ---------- */
  function boot() {
    compute(); buildSlides(); renderMenu(); hideFocus(); show(slide); restartSlides(); startAuto(); fit();
  }
  // تحديث فوري عند الحفظ من لوحة التحكم في نافذة أخرى على نفس الجهاز
  Store.onChange(d => { D = d; boot(); });

  boot(); wake();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitRows);
})();
