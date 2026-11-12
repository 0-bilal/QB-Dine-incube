/* INCUBE — لوحة التحكم. كل التعديلات تُحفظ تلقائياً في متصفح هذا الجهاز. */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = p => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const SS = "incube-admin-unlocked";

  let D = Store.load();
  let tab = "menu";
  const openCats = new Set([D.categories[0] && D.categories[0].id]);
  const openMore = new Set();

  /* ---------- أدوات عامة ---------- */
  function getPath(path) { return path.split(".").reduce((o, k) => (o == null ? o : o[k]), D); }
  function setPath(path, val) {
    const ks = path.split("."), last = ks.pop();
    const o = ks.reduce((o, k) => o[k], D);
    o[last] = val;
  }
  let savedT;
  function save(msg) {
    try {
      Store.save(D);
      const s = $("saved");
      s.textContent = msg || "تم الحفظ ✓";
      s.classList.add("flash");
      clearTimeout(savedT);
      savedT = setTimeout(() => { s.textContent = "كل التعديلات محفوظة على هذا الجهاز"; s.classList.remove("flash"); }, 1800);
      return true;
    } catch (e) {
      alertBox("تعذّر الحفظ: مساحة التخزين في المتصفح ممتلئة.\nاحذف بعض الصور المرفوعة أو استخدم صوراً أصغر، ثم حاول مرة أخرى.");
      D = Store.load(); render();
      return false;
    }
  }
  function toast(t) { const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600); }

  function modal(text, okLabel, cancel) {
    return new Promise(res => {
      $("mText").textContent = text;
      $("mOk").textContent = okLabel || "موافق";
      $("mNo").hidden = !cancel;
      $("modal").hidden = false;
      $("mOk").focus();
      const done = v => { $("modal").hidden = true; $("mOk").onclick = $("mNo").onclick = null; res(v); };
      $("mOk").onclick = () => done(true);
      $("mNo").onclick = () => done(false);
    });
  }
  const confirmBox = (t, ok) => modal(t, ok, true);
  const alertBox = t => modal(t, "حسناً", false);

  // يصغّر الصورة قبل حفظها لتوفير مساحة التخزين
  function readImage(file, max = 1400, q = 0.82) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onload = () => {
        const im = new Image();
        im.onerror = () => rej(new Error("bad image"));
        im.onload = () => {
          const s = Math.min(1, max / Math.max(im.width, im.height));
          const c = document.createElement("canvas");
          c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
          const x = c.getContext("2d");
          x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
          x.drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", q));
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function pickFile(input, multiple) {
    return new Promise(res => {
      const el = $(input);
      el.multiple = !!multiple; el.value = "";
      el.onchange = () => res(Array.from(el.files || []));
      el.click();
    });
  }

  /* ---------- مكونات صغيرة ---------- */
  const sw = (path, label, cls = "") => `<label class="sw ${cls}"><input type="checkbox" data-bind="${path}" data-type="bool" ${getPath(path) !== false ? "checked" : ""}><i></i>${label ? `<span>${label}</span>` : ""}</label>`;
  const field = (path, label, opt = {}) => {
    const v = getPath(path);
    const cls = opt.en ? "en" : opt.num ? "num" : "";
    const inp = opt.area
      ? `<textarea data-bind="${path}" class="${cls}" ${opt.en ? 'dir="ltr"' : ""}>${esc(v)}</textarea>`
      : `<input data-bind="${path}" class="${cls}" ${opt.num ? 'inputmode="decimal" data-type="num"' : ""} ${opt.en ? 'dir="ltr"' : ""} ${opt.type ? `type="${opt.type}"` : ""} value="${esc(v)}" ${opt.ph ? `placeholder="${esc(opt.ph)}"` : ""}>`;
    return `<label class="f"><span>${label}</span>${inp}</label>`;
  };
  const sel = (path, label, options) => {
    const v = getPath(path) == null ? "" : String(getPath(path));
    return `<label class="f"><span>${label}</span><select data-bind="${path}">${options.map(([val, txt]) => `<option value="${esc(val)}" ${String(val) === v ? "selected" : ""}>${esc(txt)}</option>`).join("")}</select></label>`;
  };
  const bg = src => src ? `style="background-image:url('${String(src).replace(/'/g, "%27")}')"` : "";
  const AR = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);

  /* ---------- ١. الأصناف ---------- */
  function viewMenu() {
    const cats = D.categories.map((c, ci) => {
      const p = `categories.${ci}`;
      const on = c.enabled !== false;
      const active = c.items.filter(i => i.enabled !== false).length;
      const items = c.items.map((it, ii) => {
        const ip = `${p}.items.${ii}`, ion = it.enabled !== false, key = c.id + "/" + it.id;
        return `<div class="it ${ion ? "" : "off"}">
          <div class="c-sw keep">${sw(ip + ".enabled", "")}</div>
          <button type="button" class="thumb c-th ${it.image ? "has" : ""}" ${bg(it.image)} data-act="more" data-k="${esc(key)}" title="الصورة والتفاصيل">${it.image ? "" : "+"}</button>
          <input class="c-ar" data-bind="${ip}.ar" value="${esc(it.ar)}" aria-label="الاسم بالعربي">
          <input class="c-en en" dir="ltr" data-bind="${ip}.en" value="${esc(it.en)}" aria-label="الاسم بالإنجليزي">
          <input class="c-cal num" inputmode="numeric" data-type="num" data-bind="${ip}.cal" value="${esc(it.cal)}" aria-label="السعرات">
          <input class="c-pr num" inputmode="decimal" data-type="num" data-bind="${ip}.price" value="${esc(it.price)}" aria-label="السعر">
          <button type="button" class="star c-st ${it.signature ? "on" : ""}" data-act="star" data-c="${ci}" data-i="${ii}" title="مشروب مميز">★</button>
          <div class="rowacts c-act keep">
            <button type="button" class="b sm icon" data-act="mvItem" data-c="${ci}" data-i="${ii}" data-d="-1" title="للأعلى">↑</button>
            <button type="button" class="b sm icon" data-act="mvItem" data-c="${ci}" data-i="${ii}" data-d="1" title="للأسفل">↓</button>
            <button type="button" class="b sm" data-act="more" data-k="${esc(key)}">${openMore.has(key) ? "إخفاء" : "المزيد"}</button>
          </div>
          ${openMore.has(key) ? `<div class="more keep">
            ${field(ip + ".subAr", "وصف إضافي بالعربي (اختياري)")}
            ${field(ip + ".subEn", "وصف إضافي بالإنجليزي (اختياري)", { en: true })}
            <div class="f"><span>صورة الصنف (تظهر عند الضغط عليه في المنيو)</span>
              <div class="imgctl">
                <select data-bind="${ip}.image" aria-label="اختيار صورة">${libraryOptions(it.image)}</select>
                <button type="button" class="b sm" data-act="itemImg" data-c="${ci}" data-i="${ii}">رفع صورة</button>
                <button type="button" class="b sm danger" data-act="delItem" data-c="${ci}" data-i="${ii}">حذف الصنف</button>
              </div></div>
          </div>` : ""}
        </div>`;
      }).join("");
      return `<details class="box ${on ? "" : "off"}" data-cat="${esc(c.id)}" ${openCats.has(c.id) ? "open" : ""}>
        <summary><span class="chev">‹</span><span class="ttl">${esc(c.ar)}<small>${esc(c.en)}</small></span>
          <span class="pill ${on ? "on" : "off"}">${on ? `ظاهر · ${AR(active)}/${AR(c.items.length)}` : "مخفي"}</span></summary>
        <div class="boxbody">
          <div class="grid" style="margin-bottom:18px">
            ${field(p + ".ar", "اسم القسم بالعربي")}
            ${field(p + ".en", "اسم القسم بالإنجليزي", { en: true })}
            ${field(p + ".short", "اسم مختصر للتبويب (اختياري)", { en: true, ph: "مثال: COLD & MATCHA" })}
            <div class="f"><span>القسم</span><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;min-height:42px">
              ${sw(p + ".enabled", "إظهار في المنيو")}
              <button type="button" class="b sm icon" data-act="mvCat" data-c="${ci}" data-d="-1" title="تقديم القسم">↑</button>
              <button type="button" class="b sm icon" data-act="mvCat" data-c="${ci}" data-d="1" title="تأخير القسم">↓</button>
              <button type="button" class="b sm danger" data-act="delCat" data-c="${ci}">حذف القسم</button></div></div>
          </div>
          <div class="items">
            <div class="itemsHead"><span>ظاهر</span><span>صورة</span><span>الاسم بالعربي</span><span>الاسم بالإنجليزي</span><span>السعرات</span><span>السعر</span><span>مميز</span><span></span></div>
            ${items || `<p style="color:var(--muted)">لا توجد أصناف في هذا القسم.</p>`}
          </div>
          <button type="button" class="b addrow" data-act="addItem" data-c="${ci}">+ إضافة صنف</button>
        </div></details>`;
    }).join("");
    return `<div class="head"><div><h2>الأصناف والأسعار</h2>
      <p>أطفئ المفتاح لإخفاء صنف أو قسم من المنيو دون حذفه. التعديلات تُحفظ تلقائياً وتظهر فوراً في شاشة المنيو المفتوحة على نفس الجهاز.</p></div>
      <div class="acts"><button type="button" class="b" data-act="addCat">+ قسم جديد</button></div></div>${cats}`;
  }

  function libraryOptions(current) {
    const lib = new Set(window.INCUBE_LIBRARY);
    D.ads.forEach(a => a.src && lib.add(a.src));
    D.categories.forEach(c => c.items.forEach(i => i.image && lib.add(i.image)));
    let n = 0;
    const opts = [["", "بدون صورة"]].concat(Array.from(lib).map(s => [s, s.startsWith("data:") ? `صورة مرفوعة ${AR(++n)}` : s.split("/").pop().replace(/_2026.*$/, "").replace("photo_", "صورة المستودع ")]));
    return opts.map(([v, t]) => `<option value="${esc(v)}" ${v === (current || "") ? "selected" : ""}>${esc(t)}</option>`).join("");
  }

  /* ---------- ٢. اللوحة الإعلانية ---------- */
  function viewPanel() {
    const on = D.promoPanel.enabled !== false;
    return `<div class="head"><div><h2>اللوحة الإعلانية</h2>
      <p>الجهة اليسرى من الشاشة التي تعرض صور المنتجات والإعلانات. عند إطفائها يأخذ المنيو كامل عرض الشاشة.</p></div></div>
      <div class="box ${on ? "" : "off"}"><div class="boxhead">${sw("promoPanel.enabled", "<b>تشغيل اللوحة الإعلانية</b>")}
        <span class="pill ${on ? "on" : "off"}">${on ? "تعمل" : "متوقفة"}</span></div>
        <div class="boxbody"><div class="grid">
          ${field("promoPanel.brand", "النص أعلى اللوحة (الشعار)", { en: true })}
          ${field("promoPanel.slideSeconds", "مدة عرض كل إعلان (ثانية)", { num: true })}
        </div>
        <div style="display:flex;gap:28px;flex-wrap:wrap;margin-top:18px">
          ${sw("promoPanel.showBrand", "إظهار الشعار")}
          ${sw("promoPanel.showCard", "إظهار بطاقة اسم المنتج وسعره على الصورة")}
          ${sw("promoPanel.showDots", "إظهار مؤشر الإعلانات")}
        </div></div></div>
      <p style="color:var(--muted)">لإضافة الإعلانات أو تعديلها أو إيقاف إعلان معيّن انتقل إلى قسم <a href="#" data-act="go" data-t="ads">الإعلانات</a>.</p>`;
  }

  /* ---------- ٣. الإعلانات ---------- */
  function itemOptions() {
    const o = [["", "بدون ربط (بدون بطاقة)"]];
    D.categories.forEach(c => c.items.forEach(i => o.push([c.id + ":" + i.id, `${c.ar} ← ${i.ar}`])));
    return o;
  }
  function viewAds() {
    const opts = itemOptions();
    const list = D.ads.map((a, i) => {
      const p = `ads.${i}`, on = a.enabled !== false;
      const prev = a.type === "text"
        ? `<div class="adprev" style="background:${esc(a.bg || "#5B3A24")};color:${esc(a.fg || "#F4EBE2")}"><small>${esc(a.eyebrow)}</small><b>${esc(a.title)}</b></div>`
        : `<div class="adprev ${a.fit === "contain" ? "contain" : ""}" ${bg(a.src)}></div>`;
      const fields = a.type === "text"
        ? `<div class="grid">
            ${field(p + ".eyebrow", "سطر علوي صغير", { en: true })}
            ${field(p + ".title", "العنوان الكبير (Enter لسطر جديد)", { area: true, en: true })}
            ${field(p + ".subtitle", "عنوان فرعي", { en: true })}
            ${field(p + ".titleAr", "سطر بالعربي")}
            ${field(p + ".footer", "نص أسفل اليسار", { area: true, en: true })}
            ${field(p + ".price", "السعر (اختياري)", { en: true })}
            ${field(p + ".priceUnit", "وحدة السعر", { en: true })}
            <div class="f"><span>الألوان (الخلفية / النص)</span><div class="colors">
              <input type="color" data-bind="${p}.bg" value="${esc(a.bg || "#5B3A24")}" aria-label="لون الخلفية">
              <input type="color" data-bind="${p}.fg" value="${esc(a.fg || "#F4EBE2")}" aria-label="لون النص"></div></div>
          </div>`
        : `<div class="grid">
            ${sel(p + ".link", "ربط بصنف لإظهار اسمه وسعره", opts)}
            ${sel(p + ".fit", "طريقة عرض الصورة", [["cover", "ملء اللوحة (قص الأطراف)"], ["contain", "الصورة كاملة بدون قص"]])}
            <div class="f"><span>الصورة</span><button type="button" class="b" data-act="adImg" data-i="${i}">استبدال الصورة</button></div>
          </div>`;
      return `<div class="box ${on ? "" : "off"}"><div class="ad">${prev}<div style="min-width:0">
        <div class="adtop"><span class="ttl">${a.type === "text" ? "إعلان نصي" : "إعلان صورة"} ${AR(i + 1)}</span>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${sw(p + ".enabled", on ? "يعمل" : "متوقف")}
            <button type="button" class="b sm icon" data-act="mvAd" data-i="${i}" data-d="-1" title="تقديم">↑</button>
            <button type="button" class="b sm icon" data-act="mvAd" data-i="${i}" data-d="1" title="تأخير">↓</button>
            <button type="button" class="b sm danger" data-act="delAd" data-i="${i}">حذف</button></div></div>
        ${fields}</div></div></div>`;
    }).join("");
    const panelOff = D.promoPanel.enabled === false;
    return `<div class="head"><div><h2>الإعلانات</h2>
      <p>تتبدّل الإعلانات المفعّلة بالترتيب في اللوحة الإعلانية. المقاس المثالي للصور 864×1200 (طولية).</p></div>
      <div class="acts"><button type="button" class="b primary" data-act="addImgAd">+ إعلان صورة</button><button type="button" class="b" data-act="addTextAd">+ إعلان نصي</button></div></div>
      ${panelOff ? `<div class="note" style="margin:0 0 18px">اللوحة الإعلانية متوقفة حالياً، فلن تظهر الإعلانات. <a href="#" data-act="go" data-t="panel">شغّلها من هنا</a>.</div>` : ""}
      ${list || `<p style="color:var(--muted)">لا توجد إعلانات بعد.</p>`}`;
  }

  /* ---------- ٤. النصوص والإعدادات ---------- */
  function viewTexts() {
    const tx = l => `<div class="grid">
      ${field(`texts.${l}.title`, "عنوان المنيو", { en: l === "en" })}
      ${field(`texts.${l}.signature`, "شرح علامة ★", { en: l === "en" })}
      ${field(`texts.${l}.thanks`, "عبارة الشكر", { en: l === "en" })}
      ${field(`texts.${l}.handle`, "حساب التواصل", { en: true })}
      ${field(`texts.${l}.note`, "ملاحظة السعرات", { area: true, en: l === "en" })}
      ${field(`texts.${l}.tagline`, "الشعار النصي", { area: true, en: l === "en" })}
      ${field(`texts.${l}.place`, "الموقع", { area: true, en: l === "en" })}</div>`;
    return `<div class="head"><div><h2>النصوص والإعدادات</h2><p>نصوص أسفل المنيو وطريقة عمل الشاشة.</p></div></div>
      <div class="box"><div class="boxhead"><b>إعدادات الشاشة</b></div><div class="boxbody">
        <div class="grid">
          ${sel("settings.defaultLang", "لغة البداية", [["ar", "العربية"], ["en", "English"]])}
          ${field("settings.idleSeconds", "بدء الوضع التلقائي بعد (ثانية بدون لمس)", { num: true })}
          ${field("settings.categorySeconds", "مدة عرض كل قسم في الوضع التلقائي (ثانية)", { num: true })}
          ${field("settings.currencyAr", "العملة بالعربي")}
          ${field("settings.currencyEn", "العملة بالإنجليزي", { en: true })}
          ${field("settings.pin", "رمز دخول لوحة التحكم (فارغ = بدون رمز)", { en: true })}
        </div>
        <div style="display:flex;gap:28px;flex-wrap:wrap;margin-top:18px">${sw("settings.autoMode", "الوضع التلقائي")}${sw("settings.showCalories", "إظهار السعرات")}</div>
      </div></div>
      <div class="box"><div class="boxhead"><b>النصوص بالعربي</b></div><div class="boxbody">${tx("ar")}</div></div>
      <div class="box"><div class="boxhead"><b>النصوص بالإنجليزي</b></div><div class="boxbody">${tx("en")}</div></div>`;
  }

  /* ---------- ٥. النسخ الاحتياطي ---------- */
  function viewBackup() {
    const kb = Math.round(Store.size() / 1024), pct = Math.min(100, Math.round(Store.size() / (5 * 1024 * 1024) * 100));
    return `<div class="head"><div><h2>النسخ الاحتياطي</h2>
      <p>التعديلات محفوظة في متصفح هذا الجهاز فقط. نزّل نسخة احتياطية بعد كل تعديل مهم، وارفعها على أي جهاز آخر لنقل نفس المنيو إليه.</p></div></div>
      <div class="cards3">
        <div class="box"><h3>تحميل نسخة احتياطية</h3><p>ملف واحد يحتوي على الأصناف والأسعار والإعلانات والصور المرفوعة والإعدادات.</p>
          <button type="button" class="b primary" data-act="export">تحميل النسخة ↓</button></div>
        <div class="box"><h3>رفع نسخة احتياطية</h3><p>يستبدل كل البيانات الحالية على هذا الجهاز بمحتوى الملف.</p>
          <button type="button" class="b" data-act="import">رفع ملف النسخة ↑</button></div>
        <div class="box"><h3>استعادة الافتراضي</h3><p>يرجع المنيو إلى البيانات الأصلية ويحذف كل التعديلات والصور المرفوعة.</p>
          <button type="button" class="b danger" data-act="reset">استعادة الافتراضي</button></div>
      </div>
      <div class="box" style="padding:18px 20px;margin-top:18px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>المساحة المستخدمة في المتصفح</span><span class="num">${kb} KB · ${pct}%</span></div>
        <div class="meter"><i style="width:${pct}%"></i></div>
        <p style="color:var(--muted);font-size:14px;margin:10px 0 0">المساحة المتاحة تقارب 5 ميجابايت. الصور المرفوعة هي أكثر ما يستهلكها.</p></div>
      <div class="note">ملاحظة: مسح بيانات المتصفح (سفاري) أو استخدام التصفح الخاص يحذف التعديلات المحلية، لذا احتفظ بنسخة احتياطية دائماً.</div>`;
  }

  /* ---------- العرض ---------- */
  const VIEWS = { menu: viewMenu, panel: viewPanel, ads: viewAds, texts: viewTexts, backup: viewBackup };
  function render() {
    const y = scrollY;
    $("main").innerHTML = VIEWS[tab]();
    document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
    scrollTo(0, y);
  }
  function go(t) { tab = t; render(); scrollTo(0, 0); }
  $("nav").onclick = e => { const b = e.target.closest("button[data-tab]"); if (b) go(b.dataset.tab); };

  /* ربط الحقول بالبيانات */
  function onInput(e) {
    const el = e.target.closest("[data-bind]");
    if (!el) return;
    let v;
    if (el.dataset.type === "bool") v = el.checked;
    else if (el.dataset.type === "num") v = el.value.trim() === "" ? "" : (isNaN(+el.value) ? el.value : +el.value);
    else v = el.value;
    setPath(el.dataset.bind, v);
    save();
    // المفاتيح والقوائم تغيّر شكل الصفحة فنعيد الرسم
    if (e.type === "change" && (el.dataset.type === "bool" || el.tagName === "SELECT" || el.type === "color")) render();
  }
  $("main").addEventListener("input", e => { if (e.target.type !== "checkbox" && e.target.tagName !== "SELECT") onInput(e); });
  $("main").addEventListener("change", onInput);
  $("main").addEventListener("toggle", e => {
    const d = e.target.closest && e.target.closest("details[data-cat]");
    if (d) d.open ? openCats.add(d.dataset.cat) : openCats.delete(d.dataset.cat);
  }, true);

  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return false; [arr[i], arr[j]] = [arr[j], arr[i]]; return true; };

  const ACT = {
    go: b => go(b.dataset.t),
    more: b => { const k = b.dataset.k; openMore.has(k) ? openMore.delete(k) : openMore.add(k); render(); },
    star: b => { const it = D.categories[b.dataset.c].items[b.dataset.i]; it.signature = !it.signature; save(); render(); },
    mvItem: b => { if (move(D.categories[b.dataset.c].items, +b.dataset.i, +b.dataset.d)) { save(); render(); } },
    mvCat: b => { if (move(D.categories, +b.dataset.c, +b.dataset.d)) { save(); render(); } },
    mvAd: b => { if (move(D.ads, +b.dataset.i, +b.dataset.d)) { save(); render(); } },
    addItem: b => {
      const c = D.categories[b.dataset.c];
      const it = { id: uid("item"), ar: "صنف جديد", en: "NEW ITEM", cal: "", price: "", enabled: true };
      c.items.push(it); openCats.add(c.id); openMore.add(c.id + "/" + it.id);
      save(); render();
    },
    delItem: async b => {
      const c = D.categories[b.dataset.c], it = c.items[b.dataset.i];
      if (!await confirmBox(`حذف "${it.ar}" نهائياً؟\nلإخفائه مؤقتاً أطفئ المفتاح بدلاً من الحذف.`, "حذف")) return;
      c.items.splice(b.dataset.i, 1); save(); render(); toast("تم حذف الصنف");
    },
    addCat: () => {
      const c = { id: uid("cat"), ar: "قسم جديد", en: "NEW SECTION", short: "", enabled: true, items: [] };
      D.categories.push(c); openCats.add(c.id); save(); render();
      const el = document.querySelector(`details[data-cat="${c.id}"]`); if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    delCat: async b => {
      const c = D.categories[b.dataset.c];
      if (!await confirmBox(`حذف قسم "${c.ar}" مع كل أصنافه (${AR(c.items.length)})؟`, "حذف القسم")) return;
      D.categories.splice(b.dataset.c, 1); save(); render(); toast("تم حذف القسم");
    },
    itemImg: async b => {
      const [f] = await pickFile("filePick");
      if (!f) return;
      try { D.categories[b.dataset.c].items[b.dataset.i].image = await readImage(f, 1400); if (save()) render(); }
      catch (e) { alertBox("تعذّرت قراءة الصورة. جرّب صورة بصيغة JPG أو PNG."); }
    },
    addImgAd: async () => {
      const files = await pickFile("filePick", true);
      if (!files.length) return;
      let n = 0;
      for (const f of files) {
        try { D.ads.push({ id: uid("ad"), type: "image", enabled: true, src: await readImage(f, 1400), fit: "cover", link: "" }); n++; } catch (e) {}
      }
      if (n && save()) { render(); toast(`تمت إضافة ${AR(n)} إعلان`); scrollTo(0, document.body.scrollHeight); }
    },
    adImg: async b => {
      const [f] = await pickFile("filePick");
      if (!f) return;
      try { D.ads[b.dataset.i].src = await readImage(f, 1400); if (save()) render(); }
      catch (e) { alertBox("تعذّرت قراءة الصورة. جرّب صورة بصيغة JPG أو PNG."); }
    },
    addTextAd: () => {
      D.ads.push({ id: uid("ad"), type: "text", enabled: true, eyebrow: "NEW · INCUBE", title: "NEW\nDRINK", subtitle: "", titleAr: "مشروب جديد", footer: "", price: "", priceUnit: "SAR", bg: "#141414", fg: "#FBFBF9" });
      save(); render(); scrollTo(0, document.body.scrollHeight);
    },
    delAd: async b => {
      if (!await confirmBox("حذف هذا الإعلان نهائياً؟\nلإيقافه مؤقتاً أطفئ المفتاح بدلاً من الحذف.", "حذف")) return;
      D.ads.splice(b.dataset.i, 1); save(); render(); toast("تم حذف الإعلان");
    },
    export: () => {
      const data = Object.assign({ app: "incube-menu", exportedAt: new Date().toISOString() }, D);
      const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      const d = new Date(), pad = n => String(n).padStart(2, "0");
      a.href = URL.createObjectURL(blob);
      a.download = `incube-menu-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast("تم تجهيز ملف النسخة الاحتياطية");
    },
    import: async () => {
      const [f] = await pickFile("jsonPick");
      if (!f) return;
      let data;
      try { data = JSON.parse(await f.text()); } catch (e) { return alertBox("هذا الملف ليس نسخة احتياطية صالحة (JSON)."); }
      if (!Store.isValid(data)) return alertBox("الملف لا يحتوي على بيانات منيو INCUBE.");
      const when = data.exportedAt ? new Date(data.exportedAt).toLocaleString("ar-SA") : "غير معروف";
      const n = data.categories.reduce((s, c) => s + c.items.length, 0);
      if (!await confirmBox(`استبدال البيانات الحالية بهذه النسخة؟\nتاريخ النسخة: ${when}\nعدد الأصناف: ${AR(n)} · الإعلانات: ${AR((data.ads || []).length)}`, "استبدال")) return;
      delete data.app; delete data.exportedAt;
      const prev = D;
      D = Store.migrate(data);
      if (save("تم رفع النسخة ✓")) { render(); toast("تمت استعادة النسخة الاحتياطية"); } else D = prev;
    },
    reset: async () => {
      if (!await confirmBox("استعادة البيانات الأصلية وحذف كل التعديلات على هذا الجهاز؟\nننصح بتحميل نسخة احتياطية أولاً.", "استعادة")) return;
      Store.reset(); D = Store.load(); save(); render(); toast("تمت استعادة البيانات الافتراضية");
    }
  };
  $("main").addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    if (b.tagName === "A") e.preventDefault();
    ACT[b.dataset.act] && ACT[b.dataset.act](b);
  });

  // إن عُدِّلت البيانات من نافذة أخرى
  Store.onChange(d => { D = d; if (!$("app").hidden) render(); });

  /* ---------- الدخول ---------- */
  function unlocked() { try { return sessionStorage.getItem(SS) === "1"; } catch (e) { return false; } }
  function enter() { $("lock").hidden = true; $("app").hidden = false; render(); }
  if (!D.settings.pin || unlocked()) enter();
  else { $("lock").hidden = false; $("pin").focus(); }
  $("lockForm").onsubmit = e => {
    e.preventDefault();
    if ($("pin").value === String(D.settings.pin)) { try { sessionStorage.setItem(SS, "1"); } catch (e) {} enter(); }
    else { $("pinErr").hidden = false; $("pin").value = ""; }
  };
})();
