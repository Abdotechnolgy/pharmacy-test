"use client";

// Helper لرفع صورة من فورم أدمن لـ Supabase Storage — بيرجع الرابط العام
// الجاهز يتحط في عمود image_url. bucket لازم يكون واحد من: products,
// categories, offers, services, blog.
export async function uploadImage(file, bucket) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "فشل رفع الصورة");
  }
  return res.json(); // { url, path }
}
