import { adminFetch } from "./adminFetch";

// ✏️ المنتجات بقت بتتخزن في جدول products حقيقي في Supabase بدل localStorage.
export async function loadProducts(seed) {
  try {
    const res = await fetch("/api/products", { cache: "no-store" });
    if (!res.ok) return seed;
    const data = await res.json();
    return data.length ? data : seed;
  } catch {
    return seed;
  }
}

// بيستقبل array المنتجات الكامل وبيبعته كـ bulk update لكل صف عنده id موجود
// بالفعل. لإضافة منتج جديد استخدم createProduct، ولحذف منتج استخدم deleteProduct.
export async function saveProducts(products) {
  const existing = products.filter((p) => p.id != null);
  if (existing.length) {
    return adminFetch("/api/products", { method: "PUT", body: JSON.stringify(existing) });
  }
}

export async function createProduct(product) {
  return adminFetch("/api/products", { method: "POST", body: JSON.stringify(product) });
}

export async function deleteProduct(id) {
  return adminFetch(`/api/products/${id}`, { method: "DELETE" });
}

export async function resetProducts(seed) {
  // بيرجّع صفوف البذرة الأصلية (id 1 لحد 12) لقيمها الافتراضية فعليًا في
  // قاعدة البيانات — أي منتج زودته بعد كده (id تاني) مش بيتلمس أو يتحذف.
  await saveProducts(seed);
  return seed;
}
