import { adminFetch } from "./adminFetch";

// ✏️ العروض بقت بتتخزن في جدول offers حقيقي في Supabase بدل localStorage.
export async function loadOffers(seed) {
  try {
    const res = await fetch("/api/offers", { cache: "no-store" });
    if (!res.ok) return seed;
    const data = await res.json();
    return data;
  } catch {
    return seed;
  }
}

// بيستقبل array العروض الكامل وبيبعته كـ bulk update لكل صف عنده id موجود
// بالفعل. لإضافة عرض جديد استخدم createOffer، ولحذف عرض استخدم deleteOffer.
export async function saveOffers(offers) {
  const existing = offers.filter((o) => o.id != null);
  if (existing.length) {
    return adminFetch("/api/offers", { method: "PUT", body: JSON.stringify(existing) });
  }
}

export async function createOffer(offer) {
  return adminFetch("/api/offers", { method: "POST", body: JSON.stringify(offer) });
}

export async function deleteOffer(id) {
  return adminFetch(`/api/offers/${id}`, { method: "DELETE" });
}

export async function resetOffers(seed) {
  await saveOffers(seed);
  return seed;
}

// عرض بيتحسب "منتهي" تلقائيًا لو تاريخ النهاية فات، بغض النظر عن الـ status
// المحفوظ — ده بيمنع عرض عروض قديمة غلط حتى لو الأدمن نسي يوقفها يدويًا.
// حالة العرض الحقيقية حسب التواريخ — قبل تاريخ البداية = upcoming (لسه ما
// بدأش)، بعد تاريخ النهاية = expired (انتهى)، بينهم = active بس لو status
// الأدمن كمان "active" (ممكن يوقف عرض يدويًا حتى لو في فترته الزمنية الصحيحة).
export function computeOfferState(offer) {
  const today = new Date().toISOString().slice(0, 10);
  if (offer.endDate && offer.endDate < today) return "expired";
  if (offer.startDate && offer.startDate > today) return "upcoming";
  return offer.status === "active" ? "active" : "inactive";
}

export function isOfferLive(offer) {
  return computeOfferState(offer) === "active";
}

export function discountPercent(offer) {
  if (!offer.oldPrice || !offer.newPrice) return 0;
  return Math.round((1 - offer.newPrice / offer.oldPrice) * 100);
}

// بيرجع الوقت المتبقي لنهاية العرض بناءً على endDate الحقيقي المخزّن في العرض نفسه.
// لو العرض مفيهوش endDate، بيرجع null — عشان منعرضش أي countdown وهمي في الواجهة.
// (لا تستخدم الفنكشن دي لاختراع تاريخ نهاية، هي بس بتقرأ endDate الموجود فعلًا)
export function getOfferCountdown(offer) {
  if (!offer?.endDate) return null;
  const end = new Date(`${offer.endDate}T23:59:59`).getTime();
  if (Number.isNaN(end)) return null;
  const now = Date.now();
  const totalMs = end - now;
  if (totalMs <= 0) return null;

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return { totalMs, days, hours, minutes, seconds };
}

// بيرجع خريطة { productId: offerEnriched } لكل العروض الحية فقط —
// عشان أي كارد منتج في أي مكان في الموقع يقدر يعرف إن فيه خصم فعلي عليه ولا لأ
// من غير ما يكرر منطق الفلترة والتحقق من isOfferLive في كل مكان.
export function getActiveOffersMap(offers) {
  const map = {};
  for (const offer of offers) {
    if (isOfferLive(offer)) {
      map[offer.productId] = offer;
    }
  }
  return map;
}
export function enrichOffer(offer, products) {
  const product = products.find((p) => p.id === offer.productId);
  if (!product) return null;
  return {
    ...offer,
    name: product.name,
    category: product.category,
    icon: product.icon,
    image: offer.image || product.image,
    description: offer.description || product.description,
  };
}
