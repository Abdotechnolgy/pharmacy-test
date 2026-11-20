import { adminFetch } from "./adminFetch";

// ✏️ تحكم الأدمن في قسم "أحدث المنتجات" — بدل الاختيار التلقائي بس (حسب id).
// mode: "auto" (الافتراضي — أحدث المنتجات حسب الإضافة، زي ما كان دايمًا)
//       "manual" (الأدمن بيختار المنتجات وترتيبها بنفسه من /admin/latest-products)
// entries: [{ productId, enabled }] — بترتيب الظهور. "enabled=false" بيخلي المنتج
// يفضل في القائمة (يقدر يرجّعه بسهولة) من غير ما يظهر في القسم فعليًا.
// لو mode="manual" لكن مفيش أي entry enabled (أو كل المنتجات المختارة اتحذفت)،
// بيرجع تلقائيًا لـ "auto" عشان القسم ميفضلش فاضي (fallback آمن، مطلوب صراحة).
// بقى متخزن في جدول latest_products_config في Supabase بدل localStorage.
const DEFAULT_CONFIG = { mode: "auto", entries: [] };

export async function loadLatestProductsConfig() {
  try {
    const res = await fetch("/api/latest-products-config", { cache: "no-store" });
    if (!res.ok) return DEFAULT_CONFIG;
    const data = await res.json();
    return { ...DEFAULT_CONFIG, ...data };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveLatestProductsConfig(config) {
  return adminFetch("/api/latest-products-config", { method: "PUT", body: JSON.stringify(config) });
}

export async function resetLatestProductsConfig() {
  await saveLatestProductsConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

// بيرجع قائمة المنتجات النهائية اللي المفروض تظهر في القسم، بأمان:
// - manual + فيه entries مفعّلة وصالحة (لسه موجودة فعليًا) => بترتيب الأدمن
// - manual لكن مفيش entries مفعّلة/صالحة => auto fallback
// - auto => الأحدث حسب id تنازليًا (نفس المنطق القديم)
export function resolveLatestProducts(config, allProducts, limit = 6) {
  if (config.mode === "manual" && config.entries?.length) {
    const byId = new Map(allProducts.map((p) => [p.id, p]));
    const manual = config.entries
      .filter((e) => e.enabled)
      .map((e) => byId.get(e.productId))
      .filter(Boolean);
    if (manual.length > 0) return manual.slice(0, limit);
  }
  return [...allProducts].sort((a, b) => b.id - a.id).slice(0, limit);
}
