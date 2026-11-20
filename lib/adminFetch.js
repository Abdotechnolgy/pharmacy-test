"use client";

// Helper موحّد لأي طلب كتابة (POST/PUT/DELETE) من صفحات لوحة التحكم. مبيبعتش
// أي هيدر باسورد يدوي — جلسة الأدمن الحقيقية (Supabase Auth) متخزنة في httpOnly
// cookie، والمتصفح بيبعتها تلقائيًا مع أي طلب لنفس الموقع (credentials: "same-origin"
// هي القيمة الافتراضية لـ fetch أصلًا). لو الجلسة انتهت، الـ API هيرجع 401.
export async function adminFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `فشل الطلب (${res.status})`);
  }
  return res.json();
}
