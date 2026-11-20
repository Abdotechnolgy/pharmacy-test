import "server-only";

// بيحوّل أي error راجع من Supabase (أو أي حاجة تانية) لرسالة عامة آمنة للمستخدم،
// وفي نفس الوقت بيسجّل التفاصيل الكاملة (اللي ممكن تحتوي على أسماء أعمدة/جداول
// داخلية أو تفاصيل تقنية حساسة) في الـ server logs بس. الهدف: مفيش أي رسالة
// خطأ من الـ API تسرّب تفاصيل قاعدة البيانات أو الـ stack trace للمتصفح
// (Priority 3 — public API hardening).
const DEFAULT_MESSAGE = "حصل خطأ غير متوقع، حاول تاني لاحقًا";

export function safeError(error, publicMessage = DEFAULT_MESSAGE, status = 500) {
  // eslint-disable-next-line no-console
  console.error("[api-error]", error);
  return Response.json({ error: publicMessage }, { status });
}
