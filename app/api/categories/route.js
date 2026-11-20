import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowsToCamel, rowToCamel, objectToSnake } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

// GET /api/categories
export async function GET() {
  const { data, error } = await supabaseAdmin.from("categories").select("*").order("sort_order", { ascending: true });
  if (error) return safeError(error);
  return Response.json(rowsToCamel(data));
}

// POST /api/categories
export async function POST(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  
  // ندعم name أو title تحسباً لاختلاف المسميات في الفرونت إند
  let { id, name, title, slug, ...rest } = body;
  
  const categoryName = name || title;
  if (!categoryName?.trim()) {
    return Response.json({ error: "اسم التصنيف مطلوب" }, { status: 400 });
  }

  // معالجة الرابط (slug) تلقائياً لمنع أخطاء 400
  if (!slug || !slug.trim()) {
    slug = `category-${Date.now()}`; // توليد رابط تلقائي إذا لم يُرسل
  } else {
    // تنظيف الرابط من أي حروف غير إنجليزية أو مسافات
    slug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) slug = `category-${Date.now()}`;
  }

  // تجهيز البيانات لقاعدة البيانات
  const dbPayload = objectToSnake({ ...rest, name: categoryName, slug });

  const { data, error } = await supabaseAdmin.from("categories").insert(dbPayload).select().single();
  if (error) {
    if (error.code === "23505") return Response.json({ error: "الرابط (slug) ده مستخدم بالفعل في تصنيف تاني" }, { status: 409 });
    return safeError(error);
  }
  return Response.json(rowToCamel(data), { status: 201 });
}

// PUT /api/categories
export async function PUT(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  
  // السماح بتعديل تصنيف واحد (Object) أو عدة تصنيفات (Array)
  const categoriesArray = Array.isArray(body) ? body : [body];
  
  if (categoriesArray.length === 0) {
    return Response.json({ error: "لا توجد بيانات للتعديل" }, { status: 400 });
  }

  const results = [];
  for (const category of categoriesArray) {
    // استخراج البيانات وتجاهل الحقول التي لا يجب تحديثها
    const { id, name, title, slug, created_at, ...rest } = category;
    
    // إذا تم إرسال اسم جديد أو رابط جديد نحدثهم
    const updateData = { ...rest };
    if (name || title) updateData.name = name || title;
    
    if (slug) {
       updateData.slug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
       if (!updateData.slug) delete updateData.slug;
    }

    const dbPayload = objectToSnake(updateData);
    
    const { data, error } = await supabaseAdmin.from("categories").update(dbPayload).eq("id", id).select().single();
    if (error) return safeError(error);
    results.push(rowToCamel(data));
  }
  
  // إذا تم إرسال كائن واحد، نرجع كائن واحد، وإذا كانت مصفوفة نرجع مصفوفة
  return Response.json(Array.isArray(body) ? results : results[0]);
}