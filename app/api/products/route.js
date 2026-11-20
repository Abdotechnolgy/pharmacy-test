import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowToCamel, objectToSnake } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

// المنتج مرتبط بـ category_id (Foreign Key حقيقي)، لكن بنرجّع "category" كاسم
// نصي (join مع جدول categories) عشان كل كود الفرونت إند القديم اللي بيفلتر
// بالاسم يفضل شغال من غير أي تغيير. categoryId و categorySlug موجودين كمان
// لأي كود جديد محتاج يستخدم الـ id الحقيقي مباشرة.
function flattenProduct(row) {
  const { categories, ...rest } = row;
  const camel = rowToCamel(rest);
  return {
    ...camel,
    category: categories?.name || camel.category || "",
    categorySlug: categories?.slug || null,
  };
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, categories(name, slug)")
    .order("id", { ascending: true });
  if (error) return safeError(error);
  return Response.json(data.map(flattenProduct));
}

// بيتأكد إن categoryId (لو موجود) بيتحول لصف category صحيح، وبيحفظ اسمه في
// عمود category النصي القديم كمان (تزامن احتياطي أثناء فترة الانتقال).
async function resolveCategoryFields(rest) {
  if (rest.categoryId == null) return rest;
  const { data: cat } = await supabaseAdmin.from("categories").select("name").eq("id", rest.categoryId).single();
  return { ...rest, category: cat?.name || rest.category || "" };
}

export async function POST(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, categorySlug, ...rest } = body;

  if (!rest.name?.trim()) return Response.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
  if (!(Number(rest.price) > 0)) return Response.json({ error: "السعر لازم يكون رقم أكبر من صفر" }, { status: 400 });

  const resolved = await resolveCategoryFields(rest);
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(objectToSnake(resolved))
    .select("*, categories(name, slug)")
    .single();
  if (error) return safeError(error);
  return Response.json(flattenProduct(data), { status: 201 });
}

export async function PUT(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  if (!Array.isArray(body)) return Response.json({ error: "المطلوب array من المنتجات" }, { status: 400 });

  const results = [];
  for (const product of body) {
    const { id, categorySlug, ...rest } = product;
    if (!(Number(rest.price) > 0)) return Response.json({ error: "السعر لازم يكون رقم أكبر من صفر" }, { status: 400 });
    const resolved = await resolveCategoryFields(rest);
    const { data, error } = await supabaseAdmin
      .from("products")
      .update(objectToSnake(resolved))
      .eq("id", id)
      .select("*, categories(name, slug)")
      .single();
    if (error) return safeError(error);
    results.push(flattenProduct(data));
  }
  return Response.json(results);
}
