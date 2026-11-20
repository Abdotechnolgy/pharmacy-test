import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { rowToCamel, objectToSnake } from "../../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../../lib/requireAdmin";
import { safeError } from "../../../../lib/apiError";

export async function PUT(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, ...rest } = body;

  if (rest.isPublished && !rest.publishedAt) {
    rest.publishedAt = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin.from("blog_posts").update(objectToSnake(rest)).eq("id", params.id).select().single();
  if (error) {
    if (error.code === "23505") return Response.json({ error: "الرابط (slug) ده مستخدم بالفعل في مقال تاني" }, { status: 409 });
    return safeError(error);
  }
  return Response.json(rowToCamel(data));
}

export async function DELETE(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", params.id);
  if (error) return safeError(error);
  return Response.json({ success: true });
}
