import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowsToCamel, rowToCamel, objectToSnake } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

// GET /api/blog — الزوار بيشوفوا المقالات المنشورة بس. الأدمن (لوحة التحكم)
// بيبعت ?all=true عشان يشوف المسودات (غير المنشورة) كمان.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wantsAll = searchParams.get("all") === "true";

  let query = supabaseAdmin.from("blog_posts").select("*").order("published_at", { ascending: false, nullsFirst: false });
  if (wantsAll) {
    if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  } else {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) return safeError(error);
  return Response.json(rowsToCamel(data));
}

export async function POST(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, ...rest } = body;

  if (!rest.title?.trim() || !rest.slug?.trim()) {
    return Response.json({ error: "العنوان والرابط (slug) مطلوبين" }, { status: 400 });
  }
  if (rest.isPublished && !rest.publishedAt) {
    rest.publishedAt = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin.from("blog_posts").insert(objectToSnake(rest)).select().single();
  if (error) {
    if (error.code === "23505") return Response.json({ error: "الرابط (slug) ده مستخدم بالفعل في مقال تاني" }, { status: 409 });
    return safeError(error);
  }
  return Response.json(rowToCamel(data), { status: 201 });
}
