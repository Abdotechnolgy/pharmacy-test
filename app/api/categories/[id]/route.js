import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { rowToCamel, objectToSnake } from "../../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../../lib/requireAdmin";
import { safeError } from "../../../../lib/apiError";

// PUT /api/categories/:id — تعديل تصنيف واحد (أدمن بس)
export async function PUT(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, ...rest } = body;

  if (rest.slug != null && !/^[a-z0-9-]+$/.test(rest.slug)) {
    return Response.json({ error: "الرابط (slug) لازم يكون حروف إنجليزية صغيرة وأرقام وشرطات بس" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(objectToSnake(rest))
    .eq("id", params.id)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") return Response.json({ error: "الرابط (slug) ده مستخدم بالفعل في تصنيف تاني" }, { status: 409 });
    return safeError(error);
  }
  return Response.json(rowToCamel(data));
}

// DELETE /api/categories/:id (أدمن بس) — بيتمنع لو فيه منتجات مرتبطة بالاسم ده
export async function DELETE(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();

  const { data: category } = await supabaseAdmin.from("categories").select("name").eq("id", params.id).single();
  if (category) {
    const { count } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", category.name);
    if (count && count > 0) {
      return Response.json({ error: `مينفعش تحذف القسم — فيه ${count} منتج مرتبط بيه` }, { status: 409 });
    }
  }

  const { error } = await supabaseAdmin.from("categories").delete().eq("id", params.id);
  if (error) return safeError(error);
  return Response.json({ success: true });
}
