"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Save, X, Eye, EyeOff, Newspaper, Calendar } from "lucide-react";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { useToast } from "../../../../components/admin/Toast";
import { loadAllPosts, createPost, updatePost, deletePost } from "../../../../lib/blogStore";
import { slugify } from "../../../../lib/categoriesStore";

function emptyForm() {
  return { id: null, title: "", slug: "", excerpt: "", content: "", isPublished: false };
}

export default function AdminBlogPage() {
  const { show } = useToast();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setSlugEdited(false);
  };

  const handleTitleChange = (title) => {
    setForm((f) => ({ ...f, title, slug: slugEdited ? f.slug : slugify(title) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      show("العنوان والرابط والمحتوى مطلوبين", "error");
      return;
    }
    try {
      if (editingId) {
        const updated = await updatePost(editingId, form);
        setPosts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        show("تم حفظ تعديل المقال", "success");
      } else {
        const created = await createPost(form);
        setPosts((prev) => [created, ...prev]);
        show("تم إضافة المقال بنجاح", "success");
      }
      resetForm();
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const handleEdit = (post) => {
    setForm({ id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, isPublished: post.isPublished });
    setEditingId(post.id);
    setSlugEdited(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePublish = async (post) => {
    try {
      const updated = await updatePost(post.id, { isPublished: !post.isPublished });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
      show(updated.isPublished ? "تم نشر المقال" : "تم إلغاء نشر المقال", "info");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء التحديث", "error");
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deletePost(confirmDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      if (editingId === confirmDelete.id) resetForm();
      show("تم حذف المقال", "success");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحذف", "error");
    }
    setConfirmDelete(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">المدونة</h1>
        <p className="text-xs text-navy/50 mt-1">{posts.length} مقال</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-navy/10 p-5 mb-8 grid gap-4">
        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">عنوان المقال</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">الرابط (Slug)</label>
          <input
            type="text"
            dir="ltr"
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-emerald/40"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">مقتطف قصير</label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">المحتوى (سيب سطر فاضي بين كل فقرة وفقرة)</label>
          <textarea
            rows={8}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
            className="w-4 h-4 accent-emerald"
          />
          نشر المقال (يظهر لزوار الموقع)
        </label>

        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-emerald text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-navy transition-colors">
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "حفظ التعديل" : "إضافة مقال"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 text-navy px-5 py-2.5 text-sm font-semibold">
              <X className="w-4 h-4" />
              إلغاء
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-center text-navy/40 py-16 text-sm">جاري التحميل...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">
          <Newspaper className="w-8 h-8 mx-auto mb-2 text-navy/30" />
          مفيش مقالات لسه.
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-white border border-navy/10 p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-navy/40 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar-EG") : "لسه مش منشور"}
                </div>
                <p className="font-semibold text-navy text-sm truncate">{post.title}</p>
                <p className="text-xs text-navy/45 mt-1 line-clamp-1">{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  aria-label={post.isPublished ? "إلغاء النشر" : "نشر"}
                  className={`p-1.5 rounded-lg ${post.isPublished ? "text-emerald hover:bg-emerald/10" : "text-navy/40 hover:bg-navy/5"}`}
                >
                  {post.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleEdit(post)} aria-label="تعديل" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-emerald">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDelete(post)} aria-label="حذف" className="p-1.5 rounded-lg text-navy/50 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="حذف المقال؟"
        message={confirmDelete ? `هيتم حذف "${confirmDelete.title}" نهائيًا.` : ""}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
