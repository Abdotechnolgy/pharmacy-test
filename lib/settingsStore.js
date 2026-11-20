"use client";

import { adminFetch } from "./adminFetch";

// ✏️ بعد ما اتوصل المشروع بـ Supabase، الإعدادات بقت بتتخزن في قاعدة بيانات
// حقيقية (جدول site_settings) بدل localStorage — أي تعديل من /admin/settings
// بيتحفظ لكل زوار الموقع من أي جهاز، مش المتصفح الحالي بس.
export async function loadSettings(seed) {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) return seed;
    const data = await res.json();
    return { ...seed, ...data };
  } catch {
    return seed;
  }
}

export async function saveSettings(settings) {
  return adminFetch("/api/settings", { method: "PUT", body: JSON.stringify(settings) });
}

export async function resetSettings(seed) {
  await saveSettings(seed);
  return seed;
}
