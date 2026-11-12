/* البيانات الافتراضية للمنيو — تُستخدم عند أول تشغيل أو عند "استعادة الافتراضي".
   كل التعديلات بعد ذلك تُحفظ في المتصفح (localStorage) من لوحة التحكم. */
window.INCUBE_DEFAULTS = {
  version: 1,

  settings: {
    defaultLang: "ar",        // لغة البداية: ar | en
    autoMode: true,           // التنقل التلقائي بين الأقسام عند عدم اللمس
    idleSeconds: 30,          // ثوانٍ بدون لمس قبل بدء الوضع التلقائي
    categorySeconds: 12,      // مدة عرض كل قسم في الوضع التلقائي
    showCalories: true,
    currencyAr: "ر.س",
    currencyEn: "SAR",
    pin: "1234"               // رمز دخول لوحة التحكم (اتركه فارغاً لإلغائه)
  },

  texts: {
    ar: {
      title: "القائمة",
      note: "جميع السعرات الحرارية المذكورة تقريبية، وقد تختلف حسب نوع الحليب وطريقة التحضير.",
      tagline: "مساحة للتركيز، والقهوة، والإبداع.",
      place: "مكة المكرمة، المملكة العربية السعودية",
      handle: "@INCUBECAFE",
      thanks: "شكراً لك",
      signature: "مشروب مميز"
    },
    en: {
      title: "THE MENU",
      note: "Calories are approximate and may vary based on milk choice and preparation method.",
      tagline: "A SPACE FOR\nFOCUS, COFFEE, AND CREATIVITY.",
      place: "MAKKAH, SAUDI ARABIA",
      handle: "@INCUBECAFE",
      thanks: "THANK YOU",
      signature: "SIGNATURE"
    }
  },

  /* اللوحة الإعلانية (الجهة اليسرى من الشاشة) */
  promoPanel: {
    enabled: true,
    brand: "INCUBE",
    showBrand: true,
    showCard: true,           // بطاقة اسم المنتج وسعره فوق الصورة
    showDots: true,
    slideSeconds: 7
  },

  categories: [
    { id: "hot", ar: "المشروبات الحارة", en: "HOT COFFEE", short: "", enabled: true, items: [
      { id: "hot-1",  ar: "اسبريسو", en: "ESPRESSO", cal: 5, price: 12 },
      { id: "hot-2",  ar: "ميكاتو", en: "MACCHIATO", cal: 20, price: 13 },
      { id: "hot-3",  ar: "بيكلو", en: "PICCOLO", cal: 70, price: 13 },
      { id: "hot-4",  ar: "سبانيش لاتيه", en: "SPANISH LATTE", cal: 88, price: 18 },
      { id: "hot-5",  ar: "كورتادو", en: "CORTADO", cal: 80, price: 14 },
      { id: "hot-6",  ar: "فلات وايت", en: "FLAT WHITE", cal: 120, price: 15 },
      { id: "hot-7",  ar: "كابتشينو", en: "CAPPUCCINO", cal: 100, price: 16 },
      { id: "hot-8",  ar: "لاتيه", en: "LATTE", cal: 140, price: 16 },
      { id: "hot-9",  ar: "امريكانو", en: "AMERICANO", cal: 5, price: 13 },
      { id: "hot-10", ar: "في 60", en: "V60", cal: 5, price: 18 },
      { id: "hot-11", ar: "باريستا بريك فاست", en: "BARISTA BREAKFAST", subAr: "(اسبريسو فلايت)", subEn: "(ESPRESSO FLIGHT)", cal: 180, price: 19, signature: true }
    ]},
    { id: "cold", ar: "المشروبات الباردة", en: "COLD COFFEE & MATCHA", short: "COLD & MATCHA", enabled: true, items: [
      { id: "cold-1",  ar: "ايس امريكانو", en: "ICED AMERICANO", cal: 5, price: 13 },
      { id: "cold-2",  ar: "ايس لاتيه", en: "ICED LATTE", cal: 150, price: 18 },
      { id: "cold-3",  ar: "ايس سبانيش لاتيه", en: "ICED SPANISH LATTE", cal: 230, price: 20 },
      { id: "cold-4",  ar: "ايس في 60", en: "ICED V60", cal: 5, price: 19 },
      { id: "cold-5",  ar: "كولد برو", en: "COLD BREW", cal: 5, price: 20 },
      { id: "cold-6",  ar: "اسبريسو تونيك", en: "ESPRESSO TONIC", cal: 90, price: 20, signature: true },
      { id: "cold-7",  ar: "الفريدو", en: "ALFREDO", cal: 180, price: 14, signature: true },
      { id: "cold-8",  ar: "كلاسيك ماتشا", en: "CLASSIC MATCHA", cal: 170, price: 21, signature: true },
      { id: "cold-9",  ar: "سقنتشر ماتشا فوم", en: "SIGNATURE MATCHA FOAM", cal: 175, price: 26 },
      { id: "cold-10", ar: "ايس تي دوش", en: "ICED TEA DOOSH", cal: 95, price: 19 },
      { id: "cold-11", ar: "كوكونت تشيري", en: "COCONUT CHERRY", cal: 90, price: 22 },
      { id: "cold-12", ar: "خوخ موهيتو", en: "PEACH MOJITO", cal: 50, price: 19 }
    ]},
    { id: "desserts", ar: "الحلويات", en: "DESSERTS", short: "", enabled: true, items: [
      { id: "des-1", ar: "روز بيري كيك", en: "ROSE BERRY CAKE", cal: 420, price: 24, image: "Assets/photo_4_2026-11-12_17-42-36.jpg" },
      { id: "des-2", ar: "كرانشي شوكليت كيك", en: "CRUNCHY CHOCOLATE CAKE", cal: 480, price: 25, image: "Assets/photo_1_2026-11-12_17-42-36.jpg" },
      { id: "des-3", ar: "فريش كوكيز", en: "FRESHLY BAKED COOKIES", cal: 220, price: 12 }
    ]},
    { id: "adds", ar: "الإضافات", en: "ADDS", short: "", enabled: true, items: [
      { id: "add-1", ar: "حليب الفانيليا", en: "VANILLA MILK", cal: 60, price: 4 },
      { id: "add-2", ar: "حليب خالي من اللاكتوز", en: "LACTOSE FREE MILK", cal: 45, price: 2 },
      { id: "add-3", ar: "حليب جوز الهند", en: "COCONUT MILK", cal: 35, price: 4 },
      { id: "add-4", ar: "صوص الشوكولاته البلجيكية", en: "BELGIAN CHOCOLATE SAUCE", cal: 80, price: 4 },
      { id: "add-5", ar: "صوص الكراميل", en: "CARAMEL SAUCE", cal: 70, price: 4 },
      { id: "add-6", ar: "شوت اسبريسو", en: "ESPRESSO SHOT", cal: 2, price: 4 },
      { id: "add-7", ar: "كوب ثلج", en: "CUP OF ICE", cal: 0, price: 3 }
    ]}
  ],

  /* الإعلانات: type = image (صورة) أو text (إعلان نصي).
     link = "معرّف القسم:معرّف الصنف" لإظهار بطاقة الاسم والسعر فوق الصورة. */
  ads: [
    { id: "ad-1", type: "image", enabled: true, src: "Assets/photo_1_2026-11-12_17-42-36.jpg", fit: "cover", link: "desserts:des-2" },
    { id: "ad-2", type: "text", enabled: true, eyebrow: "SIGNATURE · HOT COFFEE", title: "BARISTA\nBREAKFAST ★", subtitle: "ESPRESSO FLIGHT", titleAr: "باريستا بريك فاست · اسبريسو فلايت", footer: "HOT COFFEE\n180 CAL", price: "19", priceUnit: "SAR", bg: "#5B3A24", fg: "#F4EBE2" },
    { id: "ad-3", type: "image", enabled: true, src: "Assets/photo_4_2026-11-12_17-42-36.jpg", fit: "cover", link: "desserts:des-1" },
    { id: "ad-4", type: "image", enabled: true, src: "Assets/photo_2_2026-11-12_17-42-36.jpg", fit: "cover", link: "desserts:des-2" },
    { id: "ad-5", type: "image", enabled: true, src: "Assets/photo_5_2026-11-12_17-42-36.jpg", fit: "cover", link: "desserts:des-1" },
    { id: "ad-6", type: "image", enabled: true, src: "Assets/photo_3_2026-11-12_17-42-36.jpg", fit: "cover", link: "desserts:des-2" }
  ]
};

/* صور المستودع المتاحة للاختيار في لوحة التحكم */
window.INCUBE_LIBRARY = [1,2,3,4,5].map(n => `Assets/photo_${n}_2026-11-12_17-42-36.jpg`);
