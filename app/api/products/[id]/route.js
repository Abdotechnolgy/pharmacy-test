import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { rowToCamel, objectToSnake } from "../../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../../lib/requireAdmin";
import { safeError } from "../../../../lib/apiError";

function flattenProduct(row) {
  const { categories, ...rest } = row;
  const camel = rowToCamel(rest);
  return { ...camel, category: categories?.name || camel.category || "", categorySlug: categories?.slug || null };
}

export async function PUT(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, categorySlug, ...rest } = body;

  if (rest.price != null && !(Number(rest.price) > 0)) {
    return Response.json({ error: "السعر لازم يكون رقم أكبر من صفر" }, { status: 400 });
  }
  if (rest.categoryId != null) {
    const { data: cat } = await supabaseAdmin.from("categories").select("name").eq("id", rest.categoryId).single();
    rest.category = cat?.name || rest.category || "";
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(objectToSnake(rest))
    .eq("id", params.id)
    .select("*, categories(name, slug)")
    .single();
  if (error) return safeError(error);
  return Response.json(flattenProduct(data));
}

export async function DELETE(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return safeError(error);
  return Response.json({ success: true });
}
