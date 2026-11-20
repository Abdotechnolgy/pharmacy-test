import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { SESSION_COOKIE } from "../../../../lib/adminAuth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../../../../lib/rateLimit";

// POST /api/auth/login — بيتحقق من الإيميل والباسورد عن طريق Supabase Auth
// الحقيقي، وبعدين يتأكد إن المستخدم ده موجود في user_roles بدور admin.
// لو الاتنين تمام، بيحط access token في httpOnly cookie — الفرونت إند مبيشوفش
// التوكن نفسه أبدًا (JS مبيقدرش يقرا httpOnly cookies).
//
// ⚠️ Rate limiting: بيحد من عدد محاولات تسجيل الدخول من نفس الـ IP عشان يصعّب
// أي محاولة تخمين كلمة سر بالقوة الغاشمة (brute force). راجع lib/rateLimit.js
// لحدود وقيود الطريقة دي (in-memory، مش حماية موزّعة كاملة).
export async function POST(request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

  let email, password;
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "لازم إيميل وكلمة سر" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    return NextResponse.json({ error: "الإيميل أو كلمة السر غلط" }, { status: 401 });
  }

 const { data: roleRow, error: roleError } = await supabaseAdmin
  .from("user_roles")
  .select("role")
  .eq("user_id", data.user.id)
  .single();

console.log("[ADMIN ROLE CHECK]", {
  userId: data.user.id,
  roleRow,
  roleError,
});

  if (!roleRow || roleRow.role !== "admin") {
    // المستخدم موجود في Supabase Auth لكن مش مسجّل كأدمن — مرفوض
    return NextResponse.json({ error: "الحساب ده مش عنده صلاحية دخول لوحة التحكم" }, { status: 403 });
  }

  const res = NextResponse.json({ success: true, email: data.user.email });
  res.cookies.set(SESSION_COOKIE, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.session.expires_in || 3600,
  });
  return res;
}
