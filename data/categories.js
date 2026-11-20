// ✏️ التصنيفات بقت Entity مستقلة قابلة للإدارة بالكامل من /admin/categories.
// السطور دي مجرد "بذرة" أول مرة بس — بعد كده كل تعديل (إضافة/تعديل/حذف/ترتيب/إخفاء)
// بيتخزن ويتقرأ من lib/categoriesStore.js. عدد المنتجات بيتحسب فعليًا من data/products.js
// عن طريق مطابقة الاسم (category.name === product.category) — مفيش تصنيفات مخترعة هنا،
// هي نفس الثلاثة الموجودين فعليًا في المتجر (أدوية / مكملات غذائية / تجميل وعناية).
// icon المتاحة: Pill, Leaf, Sparkles, Heart, Droplet, Sun, Layers
export const SEED_CATEGORIES = [
  {
    id: 1,
    name: "أدوية",
    slug: "medicines",
    description: "أدوية ومستحضرات علاجية موثوقة، حسب إرشادات الصيدلي.",
    image: "",
    icon: "Pill",
    isActive: true,
    showOnHomepage: true,
    featured: true,
    sortOrder: 1,
  },
  {
    id: 2,
    name: "مكملات غذائية",
    slug: "supplements",
    description: "فيتامينات ومكملات غذائية مختارة بعناية لدعم صحتك اليومية.",
    image: "",
    icon: "Leaf",
    isActive: true,
    showOnHomepage: true,
    featured: false,
    sortOrder: 2,
  },
  {
    id: 3,
    name: "تجميل وعناية",
    slug: "beauty-care",
    description: "منتجات عناية وتجميل يومية مناسبة لكل أنواع البشرة.",
    image: "",
    icon: "Sparkles",
    isActive: true,
    showOnHomepage: true,
    featured: false,
    sortOrder: 3,
  },
];
