import { adminFetch } from "./adminFetch";

// ✏️ المدونة بقت بتتخزن في جدول blog_posts حقيقي في Supabase بدل data/blog.js.
export async function loadPublishedPosts() {
  try {
    const res = await fetch("/api/blog", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// للوحة التحكم — بيرجّع المنشور والمسودات مع بعض
export async function loadAllPosts() {
  try {
    const res = await fetch("/api/blog?all=true", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createPost(post) {
  return adminFetch("/api/blog", { method: "POST", body: JSON.stringify(post) });
}

export async function updatePost(id, post) {
  return adminFetch(`/api/blog/${id}`, { method: "PUT", body: JSON.stringify(post) });
}

export async function deletePost(id) {
  return adminFetch(`/api/blog/${id}`, { method: "DELETE" });
}

// الفقرات متخزنة كنص واحد مفصول بسطرين فاضيين — الفنكشن دي بترجّعها لمصفوفة
// فقرات عشان العرض، بدل الـ array القديم في data/blog.js.
export function splitParagraphs(content) {
  return (content || "").split(/\n{2,}/).filter(Boolean);
}
