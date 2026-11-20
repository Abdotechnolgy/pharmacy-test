import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_BUCKETS = ["products", "categories", "offers", "services", "blog"];

// POST /api/upload — بيرفع صورة لـ Supabase Storage (بدل base64 جوه قاعدة
// البيانات) وبيرجّع الرابط العام بتاعها. الفورم لازم يبعت multipart/form-data
// فيه "file" و"bucket" (اسم واحد من ALLOWED_BUCKETS).
export async function POST(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file");
  const bucket = formData.get("bucket");

  if (!file || typeof file === "string") {
    return Response.json({ error: "لازم ترفع ملف" }, { status: 400 });
  }
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return Response.json({ error: "bucket غير صحيح" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "نوع الملف لازم يكون صورة (jpg, png, webp, gif)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "حجم الصورة كبير أوي — الحد الأقصى 5 ميجابايت" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, { contentType: file.type });
  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

  const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return Response.json({ url: publicUrlData.publicUrl, path });
}

// DELETE /api/upload?bucket=products&path=xxx.jpg — لحذف صورة قديمة لما يتغيّر
// أو يتشال منتج/تصنيف (اختياري، مش إجباري إن كل استبدال صورة يستدعيها)
export async function DELETE(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");
  const path = searchParams.get("path");

  if (!ALLOWED_BUCKETS.includes(bucket) || !path) {
    return Response.json({ error: "بيانات ناقصة" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) return safeError(error);
  return Response.json({ success: true });
}
