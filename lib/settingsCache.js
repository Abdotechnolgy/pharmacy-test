import { SEED_SETTINGS } from "../data/settings";

// مشكلة حقيقية: waLink() بتتنادى synchronous جوه JSX (href={waLink(...)})، لكن
// دلوقتي البيانات جاية من API (async) مش localStorage (sync). الحل: cache بسيط
// في الذاكرة بيتعبّي مرة واحدة وقت تحميل الموقع (SettingsLoader تحت)، وأي حد
// محتاج القيمة يقرأها sync من الـ cache ده. قبل ما التحميل يخلص، بيرجع القيم
// الافتراضية الحقيقية (SEED_SETTINGS) كـ fallback مؤقت — مش بيانات وهمية.
let cache = { ...SEED_SETTINGS };

export function getSettingsCache() {
  return cache;
}

export async function primeSettingsCache() {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      cache = { ...SEED_SETTINGS, ...data };
    }
  } catch {
    // فشل التحميل (مثلاً أول Deploy قبل ما تشغّل الـ SQL) — يفضل الـ fallback
  }
  return cache;
}
