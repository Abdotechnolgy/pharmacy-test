import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabaseAdmin";

export const SESSION_COOKIE = "sb-access-token";

// بيتحقق من جلسة الأدمن الحقيقية: التوكن لازم يكون صادر فعلًا من Supabase Auth
// (مش مُخترع)، والمستخدم لازم يكون موجود في جدول user_roles بدور "admin".
// ده الفحص المُعتمَد اللي بيتنادى من كل مكان محتاج يتأكد إن الطلب جاي من أدمن حقيقي.
export async function getAdminUser(tokenOverride) {
  const token = tokenOverride || cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) return null;

  const { data: roleRow } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userData.user.id).single();
  if (!roleRow || roleRow.role !== "admin") return null;

  return userData.user;
}

// نسخة لـ API Routes اللي بتاخد Request object مباشرة (بدل next/headers cookies())
export async function getAdminUserFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  if (!token) return null;
  return getAdminUser(token);
}
