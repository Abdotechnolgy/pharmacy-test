import "server-only";
import { getAdminUserFromRequest } from "./adminAuth";

// حماية حقيقية لعمليات الكتابة (POST/PUT/DELETE) في الـ API Routes — بتتأكد
// إن فيه جلسة Supabase Auth صحيحة ومملوكة لمستخدم عنده دور "admin" فعلي في
// جدول user_roles، مش بس كلمة سر مشتركة زي الطريقة القديمة.
//
// ⚠️ حماية إضافية من CSRF (Priority 4): الـ session cookie متخزن بـ
// SameSite=Lax (شوف lib/adminAuth.js)، وده أصلاً بيمنع المتصفح إنه يبعت الـ
// cookie مع أي POST/PUT/DELETE جاية من موقع تاني. هنا بنضيف طبقة دفاع تانية:
// لو الطلب فيه هيدر Origin (المتصفحات الحديثة بتبعته تلقائيًا مع أي طلب
// كتابة)، لازم يكون نفس الـ host بتاع السيرفر نفسه — أي طلب Origin بتاعه مختلف
// بيترفض فورًا حتى لو معاه cookie صحيح.
function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // مفيش Origin header (زي بعض الأدوات/الطلبات العادية) — الاعتماد على SameSite cookie + التحقق من الجلسة تحت
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function isAuthorizedAdminRequest(request) {
  const mutating = request.method && request.method !== "GET" && request.method !== "HEAD";
  if (mutating && !isSameOriginRequest(request)) return false;
  const user = await getAdminUserFromRequest(request);
  return Boolean(user);
}

export function unauthorizedResponse() {
  return Response.json({ error: "غير مصرح — لازم تسجّل دخول كأدمن" }, { status: 401 });
}
