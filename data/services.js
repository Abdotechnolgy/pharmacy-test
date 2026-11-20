// ✏️ عدّل أو أضف خدمات هنا بسهولة — دي مجرد "بذرة" أول مرة، بعد كده الإدارة الفعلية
// من /admin/services (تعديل/حذف/إخفاء/ترتيب) وبتتخزن عن طريق lib/servicesStore.js
// cta (اختياري): "whatsapp" يفتح واتساب برسالة جاهزة، "anchor" يودي لجزء في نفس الصفحة،
// أو null لو الخدمة معلوماتية بس ومش محتاجة إجراء.
export const SERVICES = [
  {
    id: 1,
    icon: "Truck",
    title: "توصيل سريع",
    desc: "نوصل طلبك داخل مدينة أبو المطامير والمناطق المجاورة مباشرة إلى باب منزلك.",
    cta: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    icon: "MessageCircle",
    title: "استشارة صيدلية",
    desc: "تواصل مع الصيدلي مباشرة عبر واتساب لأي استفسار دوائي في أي وقت.",
    cta: { type: "whatsapp", value: "مرحبًا، أرغب في استشارة صيدلية", label: "تواصل الآن" },
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    icon: "Pill",
    title: "طلب الأدوية",
    desc: "اطلب أدويتك ومستلزماتك بسهولة من الكتالوج، أو أرسل الروشتة مباشرة.",
    cta: { type: "anchor", value: "/categories", label: "تصفّح الأقسام" },
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 4,
    icon: "Clock",
    title: "خدمة على مدار الساعة",
    desc: "الصيدلية متاحة لخدمتكم ٢٤ ساعة، طوال أيام الأسبوع، من غير استثناء.",
    cta: null,
    isActive: true,
    sortOrder: 4,
  },
];
