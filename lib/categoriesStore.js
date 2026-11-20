import { adminFetch } from "./adminFetch";

// ✏️ بعد الربط بـ Supabase، التصنيفات بقت بتتخزن في جدول categories حقيقي —
// أي تعديل من /admin/categories بيبان لكل زوار الموقع فورًا من أي جهاز.

export const DEFAULT_HOMEPAGE_LIMIT = 8;

// الحد الأقصى لعدد التصنيفات في الرئيسية بقى جزء من site_settings في قاعدة
// البيانات (عمود homepage_category_limit) بدل مفتاح localStorage منفصل.
export async function loadHomepageLimit() {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) return DEFAULT_HOMEPAGE_LIMIT;
    const data = await res.json();
    const n = Number(data.homepageCategoryLimit);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_HOMEPAGE_LIMIT;
  } catch {
    return DEFAULT_HOMEPAGE_LIMIT;
  }
}

export async function saveHomepageLimit(n) {
  const value = Math.max(1, Number(n) || DEFAULT_HOMEPAGE_LIMIT);
  return adminFetch("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ homepageCategoryLimit: value }),
  });
}

export async function loadCategories(seed) {
  try {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (!res.ok) return seed;
    const data = await res.json();
    return data.length ? data : seed;
  } catch {
    return seed;
  }
}

// بيستقبل array التصنيفات الكامل (بعد أي تعديل/ترتيب/إضافة محليًا) وبيبعته
// كـ bulk update لكل الصفوف اللي عندها id موجود بالفعل. إضافة تصنيف جديد
// (id=null) لازم تتبعت بـ createCategory بدل كده — شوف admin/categories/page.js
export async function saveCategories(categories) {
  const existing = categories.filter((c) => c.id != null);
  if (existing.length) {
    return adminFetch("/api/categories", { method: "PUT", body: JSON.stringify(existing) });
  }
}

export async function createCategory(category) {
  return adminFetch("/api/categories", { method: "POST", body: JSON.stringify(category) });
}

export async function deleteCategory(id) {
  return adminFetch(`/api/categories/${id}`, { method: "DELETE" });
}

export async function resetCategories(seed) {
  // بيرجّع صفوف البذرة الأصلية (id 1، 2، 3...) لقيمها الافتراضية فعليًا في
  // قاعدة البيانات — أي تصنيف زودته بعد كده (id تاني) مش بيتلمس أو يتحذف.
  await saveCategories(seed);
  return seed;
}

// ترتيب ثابت ومتوقع في كل مكان: sortOrder تصاعديًا، وأي تعادل بيترتب بالاسم
// عشان الترتيب ميبقاش عشوائي بين تحميلة وتانية.
export function sortCategories(categories) {
  return [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "ar"));
}

// التصنيفات اللي المفروض تظهر فعليًا في الصفحة الرئيسية: نشطة + Show on Homepage = true
export function getHomepageCategories(categories) {
  return sortCategories(categories.filter((c) => c.isActive && c.showOnHomepage));
}

// كل التصنيفات النشطة (سواء ظاهرة في الرئيسية أو لأ) — دي اللي بتتعرض في /categories
// عشان صفحة "كل الأقسام" تكون فعلًا شاملة كل حاجة قابلة للتصفح، مش بس اللي على الهوم.
export function getActiveCategories(categories) {
  return sortCategories(categories.filter((c) => c.isActive));
}

// صفحة التصنيف المستقلة تفضل شغالة طالما التصنيف نشط، حتى لو مخفي من الرئيسية
// (Show on Homepage = false معناها "مخفي من الهوم" مش "محذوف")
export function getCategoryBySlug(categories, slug) {
  return categories.find((c) => c.slug === slug && c.isActive) || null;
}

export function getCategoryByName(categories, name) {
  return categories.find((c) => c.name === name) || null;
}

export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function countProductsInCategory(products, categoryName) {
  return products.filter((p) => p.category === categoryName).length;
}

// لما اسم التصنيف يتغيّر من الأدمن، لازم كل المنتجات المرتبطة بيه (بالاسم القديم)
// تتحدث للاسم الجديد فورًا، وإلا هتفقد ربطها بالتصنيف وتختفي من صفحته.
export function renameCategoryInProducts(products, oldName, newName) {
  if (oldName === newName) return products;
  return products.map((p) => (p.category === oldName ? { ...p, category: newName } : p));
}

// نقل كل منتجات تصنيف معين إلى تصنيف تاني (يُستخدم قبل حذف تصنيف فيه منتجات)
export function moveProductsToCategory(products, fromName, toName) {
  return products.map((p) => (p.category === fromName ? { ...p, category: toName } : p));
}
